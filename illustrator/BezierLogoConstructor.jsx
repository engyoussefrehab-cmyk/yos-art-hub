//@target illustrator
/*
  Bezier Logo Constructor  v1.0
  ---------------------------------------------------------------------------
  Adobe Illustrator ExtendScript (ES3 compatible - no let/const/arrow/JSON).

  What it does
    1. Takes a raster logo (PNG/JPG/...) or existing vector artwork.
    2. Raster  -> Image Trace -> expand -> RE-FIT every contour.
       Vector  -> RE-FIT every contour of the selected artwork.
    3. "Re-fit" = the dense outline is sampled and rebuilt from scratch with
       a corner detector, extrema detection (anchors on the horizontal /
       vertical extremes with axis-aligned handles), straight-run detection
       (real straight lines, no handles) and Schneider least-squares cubic
       Bezier fitting. Result: few anchors, smooth G1 joins, hard corners kept.
    4. Compound paths / counters (holes in O, P, R, ...) keep their winding.
    5. Optional construction view on its own locked layer: grid, alignment
       guides, thin outlines, square anchors, round handle ends, clearspace
       grid (x-module). The production layer is never decorated.

  Layers produced
    Reference (original)   - dimmed, locked copy of the source
    Vector - Production    - clean editable paths (anchors selected so that
                             handles are displayed by Illustrator itself)
    Construction View      - sub-layers: Clearspace / Grid / Guides / Outline /
                             Handle lines / Handle ends / Anchors

  Install / run: File > Scripts > Other Script...  (or copy into
  Illustrator/Presets/<lang>/Scripts).
*/

var LC = (function () {

    var NAME = 'Bezier Logo Constructor';
    var VERSION = '1.0';
    var EPS = 1e-9;

    var LAYER_REF = 'Reference (original)';
    var LAYER_PROD = 'Vector - Production';
    var LAYER_CONS = 'Construction View';
    var ROOT_NAME = 'Logo (rebuilt)';

    // ------------------------------------------------------------------
    // small vector helpers
    // ------------------------------------------------------------------
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
    function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
    function mul(a, s) { return [a[0] * s, a[1] * s]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
    function len(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1]); }
    function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
    function norm(a) { var l = len(a); return l < EPS ? [0, 0] : [a[0] / l, a[1] / l]; }
    function wrap(i, n) { i = i % n; return i < 0 ? i + n : i; }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    function bezPt(b, t) {
        var mt = 1 - t;
        var c0 = mt * mt * mt, c1 = 3 * mt * mt * t, c2 = 3 * mt * t * t, c3 = t * t * t;
        return [c0 * b[0][0] + c1 * b[1][0] + c2 * b[2][0] + c3 * b[3][0],
                c0 * b[0][1] + c1 * b[1][1] + c2 * b[2][1] + c3 * b[3][1]];
    }

    function lineCurve(a, b) { return [a, a, b, b]; }

    // ------------------------------------------------------------------
    // sampling of an existing path (raw = {closed, pts:[{a,l,r}]})
    // ------------------------------------------------------------------
    function pushUnique(out, p) {
        if (out.length && dist(out[out.length - 1], p) < 1e-7) { return; }
        out.push(p);
    }

    function sampleRaw(raw, step) {
        var n = raw.pts.length, out = [], i, j;
        var segs = raw.closed ? n : n - 1;
        for (i = 0; i < segs; i++) {
            var A = raw.pts[i], B = raw.pts[(i + 1) % n];
            var b = [A.a, A.r, B.l, B.a];
            var approx = dist(b[0], b[1]) + dist(b[1], b[2]) + dist(b[2], b[3]);
            var cnt = clamp(Math.ceil(approx / step), 1, 6000);
            for (j = 0; j < cnt; j++) { pushUnique(out, bezPt(b, j / cnt)); }
        }
        if (!raw.closed) { pushUnique(out, raw.pts[n - 1].a); }
        else if (out.length > 1 && dist(out[0], out[out.length - 1]) < 1e-7) { out.pop(); }
        return out;
    }

    // ------------------------------------------------------------------
    // corner + extrema detection on the sampled polyline
    // ------------------------------------------------------------------
    function turnAngle(P, i, k, N, closed) {
        var ia = i - k, ib = i + k;
        if (closed) { ia = wrap(ia, N); ib = wrap(ib, N); }
        else if (ia < 0 || ib > N - 1) { return 0; }
        var ax = P[i][0] - P[ia][0], ay = P[i][1] - P[ia][1];
        var bx = P[ib][0] - P[i][0], by = P[ib][1] - P[i][1];
        var la = Math.sqrt(ax * ax + ay * ay), lb = Math.sqrt(bx * bx + by * by);
        if (la < EPS || lb < EPS) { return 0; }
        return Math.acos(clamp((ax * bx + ay * by) / (la * lb), -1, 1));
    }

    function findCorners(P, closed, k, thr) {
        var N = P.length, T = [], res = [], i, d;
        var k3 = Math.max(1, Math.round(k / 3));
        for (i = 0; i < N; i++) { T[i] = turnAngle(P, i, k, N, closed); res[i] = false; }
        for (i = 0; i < N; i++) {
            if (T[i] <= thr) { continue; }
            if (turnAngle(P, i, k3, N, closed) < 0.55 * T[i]) { continue; }
            var isMax = true;
            for (d = 1; d <= k && isMax; d++) {
                var ja = i - d, jb = i + d;
                if (closed) { ja = wrap(ja, N); jb = wrap(jb, N); }
                if (ja >= 0 && T[ja] >= T[i]) { isMax = false; }
                if (jb <= N - 1 && T[jb] > T[i]) { isMax = false; }
            }
            if (isMax) { res[i] = true; }
        }
        return res;
    }

    // out[i] = 0 none, 1 = x-extremum (vertical tangent), 2 = y-extremum (horizontal tangent)
    function findExtrema(P, closed, win, eps, blocked, out) {
        var N = P.length, i, d, ax;
        win = Math.min(win, Math.floor((N - 1) / 2));
        if (win < 2) { return; }
        for (i = 0; i < N; i++) {
            if (blocked[i] || out[i]) { continue; }
            if (!closed && (i - win < 0 || i + win > N - 1)) { continue; }
            for (ax = 0; ax < 2; ax++) {
                var v = P[i][ax], isMax = true, isMin = true;
                for (d = 1; d <= win && (isMax || isMin); d++) {
                    var ja = i - d, jb = i + d;
                    if (closed) { ja = wrap(ja, N); jb = wrap(jb, N); }
                    var va = P[ja][ax], vb = P[jb][ax];
                    if (!(va < v) || !(vb <= v)) { isMax = false; }
                    if (!(va > v) || !(vb >= v)) { isMin = false; }
                }
                if (isMax || isMin) {
                    var ea = P[closed ? wrap(i - win, N) : i - win][ax];
                    var eb = P[closed ? wrap(i + win, N) : i + win][ax];
                    if ((isMax && v - ea > eps && v - eb > eps) || (isMin && ea - v > eps && eb - v > eps)) {
                        out[i] = ax + 1;
                        break;
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Schneider cubic Bezier fitting (Graphics Gems I)
    // ------------------------------------------------------------------
    function b0(u) { var t = 1 - u; return t * t * t; }
    function b1(u) { var t = 1 - u; return 3 * u * t * t; }
    function b2(u) { var t = 1 - u; return 3 * u * u * t; }
    function b3(u) { return u * u * u; }

    function chordParams(d, first, last) {
        var u = [0], i;
        for (i = first + 1; i <= last; i++) { u.push(u[i - first - 1] + dist(d[i], d[i - 1])); }
        var tot = u[last - first];
        for (i = 1; i <= last - first; i++) { u[i] = tot > EPS ? u[i] / tot : i / (last - first); }
        return u;
    }

    function generateBezier(d, first, last, u, t1, t2) {
        var n = last - first + 1, i;
        var c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;
        var p0 = d[first], p3 = d[last];
        for (i = 0; i < n; i++) {
            var ui = u[i];
            var a0 = mul(t1, b1(ui)), a1 = mul(t2, b2(ui));
            c00 += dot(a0, a0); c01 += dot(a0, a1); c11 += dot(a1, a1);
            var base = add(mul(p0, b0(ui) + b1(ui)), mul(p3, b2(ui) + b3(ui)));
            var tmp = sub(d[first + i], base);
            x0 += dot(a0, tmp); x1 += dot(a1, tmp);
        }
        var det = c00 * c11 - c01 * c01;
        var aL = 0, aR = 0;
        if (Math.abs(det) > EPS) {
            aL = (x0 * c11 - x1 * c01) / det;
            aR = (c00 * x1 - c01 * x0) / det;
        }
        var seg = dist(p0, p3);
        if (aL < 1e-6 * seg || aR < 1e-6 * seg || aL > seg * 2 || aR > seg * 2) { aL = aR = seg / 3; }
        return [p0, add(p0, mul(t1, aL)), add(p3, mul(t2, aR)), p3];
    }

    function maxError(d, first, last, bez, u) {
        var worst = 0, split = Math.floor((last - first + 1) / 2), i;
        for (i = first + 1; i < last; i++) {
            var q = bezPt(bez, u[i - first]);
            var dd = (q[0] - d[i][0]) * (q[0] - d[i][0]) + (q[1] - d[i][1]) * (q[1] - d[i][1]);
            if (dd >= worst) { worst = dd; split = i; }
        }
        return [worst, split];
    }

    function newton(bez, P, u) {
        var q = bezPt(bez, u), i;
        var q1 = [], q2 = [];
        for (i = 0; i < 3; i++) { q1.push(mul(sub(bez[i + 1], bez[i]), 3)); }
        for (i = 0; i < 2; i++) { q2.push(mul(sub(q1[i + 1], q1[i]), 2)); }
        var mt = 1 - u;
        var d1 = add(add(mul(q1[0], mt * mt), mul(q1[1], 2 * mt * u)), mul(q1[2], u * u));
        var d2 = add(mul(q2[0], mt), mul(q2[1], u));
        var df = sub(q, P);
        var num = dot(df, d1), den = dot(d1, d1) + dot(df, d2);
        if (Math.abs(den) < EPS) { return u; }
        return clamp(u - num / den, 0, 1);
    }

    function fitCubic(d, first, last, t1, t2, err2, out, depth) {
        var n = last - first + 1, i;
        if (n === 2) {
            var dd = dist(d[first], d[last]) / 3;
            out.push([d[first], add(d[first], mul(t1, dd)), add(d[last], mul(t2, dd)), d[last]]);
            return;
        }
        var u = chordParams(d, first, last);
        var bez = generateBezier(d, first, last, u, t1, t2);
        var me = maxError(d, first, last, bez, u);
        if (me[0] < err2) { out.push(bez); return; }
        if (me[0] < err2 * 16) {
            for (i = 0; i < 4; i++) {
                var up = [], j;
                for (j = first; j <= last; j++) { up.push(newton(bez, d[j], u[j - first])); }
                bez = generateBezier(d, first, last, up, t1, t2);
                me = maxError(d, first, last, bez, up);
                if (me[0] < err2) { out.push(bez); return; }
                u = up;
            }
        }
        var sp = clamp(me[1], first + 1, last - 1);
        if (depth > 40) { out.push(bez); return; }
        var tc = norm(sub(d[sp - 1], d[sp + 1]));
        if (tc[0] === 0 && tc[1] === 0) { tc = norm(sub(d[first], d[last])); }
        fitCubic(d, first, sp, t1, tc, err2, out, depth + 1);
        fitCubic(d, sp, last, mul(tc, -1), t2, err2, out, depth + 1);
    }

    function distToChord(p, a, dir) {
        var v = sub(p, a);
        return Math.abs(v[0] * -dir[1] + v[1] * dir[0]);
    }

    function nearStraight(c, tol) {
        var L = dist(c[0], c[3]);
        if (L < EPS) { return false; }
        var dir = norm(sub(c[3], c[0]));
        if (distToChord(c[1], c[0], dir) > tol || distToChord(c[2], c[0], dir) > tol) { return false; }
        var s1 = dot(sub(c[1], c[0]), dir), s2 = dot(sub(c[2], c[0]), dir);
        return s1 > -0.1 * L && s1 < 1.1 * L && s2 > -0.1 * L && s2 < 1.1 * L;
    }

    // ------------------------------------------------------------------
    // straight runs inside a polyline Q
    // ------------------------------------------------------------------
    function lineOK(Q, a, b, tol) {
        var L = dist(Q[a], Q[b]);
        if (L < EPS) { return false; }
        var dir = norm(sub(Q[b], Q[a])), t;
        for (t = a + 1; t < b; t++) {
            if (distToChord(Q[t], Q[a], dir) > tol) { return false; }
            var s = dot(sub(Q[t], Q[a]), dir);
            if (s < -tol || s > L + tol) { return false; }
        }
        return true;
    }

    function findRuns(Q, tolLine, minLen, stride) {
        var m = Q.length - 1, runs = [], i = 0, j, jb;
        while (i < m) {
            jb = -1;
            for (j = i + stride; j <= m; j += stride) {
                if (lineOK(Q, i, j, tolLine)) { jb = j; } else { break; }
            }
            if (jb >= 0 && jb < m && j > m && lineOK(Q, i, m, tolLine)) { jb = m; }
            if (jb >= 0 && dist(Q[i], Q[jb]) >= minLen) {
                while (jb < m && lineOK(Q, i, jb + 1, tolLine)) { jb++; }
                var a = i, lower = runs.length ? runs[runs.length - 1][1] : 0;
                while (a > lower && lineOK(Q, a - 1, jb, tolLine)) { a--; }
                runs.push([a, jb]);
                i = jb;
            } else {
                i += stride;
            }
        }
        return runs;
    }

    // ------------------------------------------------------------------
    // fit one segment (between two split points)
    // ------------------------------------------------------------------
    function fitSegment(Q, tA, tB, tol, opt) {
        var m = Q.length - 1, curves = [], tolLine = tol * 0.3, i;
        if (m < 1) { return curves; }
        if (m === 1 || lineOK(Q, 0, m, tolLine)) { return [lineCurve(Q[0], Q[m])]; }

        function fitRange(a, b, ta, tb) {
            if (b <= a) { return; }
            var tmp = [];
            fitCubic(Q, a, b, ta, tb, tol * tol, tmp, 0);
            for (var q = 0; q < tmp.length; q++) {
                curves.push(nearStraight(tmp[q], tol * 0.3) ? lineCurve(tmp[q][0], tmp[q][3]) : tmp[q]);
            }
        }

        var stride = Math.max(1, Math.round(opt.k / 2));
        var runs = findRuns(Q, tolLine, opt.minRun, stride);
        var pos = 0, curT = tA;
        for (i = 0; i < runs.length; i++) {
            var a = runs[i][0], b = runs[i][1];
            var dir = norm(sub(Q[b], Q[a]));
            if (a > pos) { fitRange(pos, a, curT, mul(dir, -1)); }
            curves.push(lineCurve(Q[a], Q[b]));
            pos = b; curT = dir;
        }
        if (pos < m) { fitRange(pos, m, curT, tB); }
        return curves;
    }

    function at(P, N, closed, i) {
        if (closed) { return P[wrap(i, N)]; }
        return P[clamp(i, 0, N - 1)];
    }

    // unit tangent at split i; forward = pointing into the next segment, else back into the previous
    function splitTangent(P, N, closed, i, kind, kt, forward) {
        var f = at(P, N, closed, i + kt), b = at(P, N, closed, i - kt), p = P[i], v;
        if (kind === 'c') {
            v = forward ? sub(f, p) : sub(b, p);
        } else {
            v = sub(f, b);
            if (kind === 'x') { v = [0, v[1] >= 0 ? 1 : -1]; }
            else if (kind === 'y') { v = [v[0] >= 0 ? 1 : -1, 0]; }
            if (!forward) { v = [-v[0], -v[1]]; }
        }
        v = norm(v);
        if (v[0] === 0 && v[1] === 0) {
            v = norm(forward ? sub(at(P, N, closed, i + 1), p) : sub(at(P, N, closed, i - 1), p));
        }
        return v;
    }

    // ------------------------------------------------------------------
    // fit a whole contour
    // ------------------------------------------------------------------
    function fitOnce(P, closed, opt, tol) {
        var N = P.length, i;
        if (N < 2) { return null; }
        if (N === 2 && !closed) { return [lineCurve(P[0], P[1])]; }
        if (closed && N < 5) {
            var cs = [];
            for (i = 0; i < N; i++) { cs.push(lineCurve(P[i], P[(i + 1) % N])); }
            return cs;
        }
        var k = Math.max(2, Math.min(Math.round(opt.cornerWin / opt.step), Math.floor(N / 4)));
        var kt = Math.max(2, Math.round(k * 0.6));
        var corner = findCorners(P, closed, k, opt.cornerAng);

        var blocked = [], bl = Math.max(1, Math.round(k * 0.6)), d;
        for (i = 0; i < N; i++) { blocked[i] = false; }
        for (i = 0; i < N; i++) {
            if (corner[i]) {
                for (d = -bl; d <= bl; d++) {
                    var jj = closed ? wrap(i + d, N) : i + d;
                    if (jj >= 0 && jj < N) { blocked[jj] = true; }
                }
            }
        }
        var ext = [];
        for (i = 0; i < N; i++) { ext[i] = 0; }
        if (opt.snap) {
            findExtrema(P, closed, k * 3, tol * 0.5, blocked, ext);
            findExtrema(P, closed, k, tol * 0.9, blocked, ext);
            var lastIdx = [-1000000, -1000000];
            for (i = 0; i < N; i++) {
                if (ext[i]) {
                    var axx = ext[i] - 1;
                    if (i - lastIdx[axx] < k) { ext[i] = 0; } else { lastIdx[axx] = i; }
                }
            }
        }

        var splits = [];
        for (i = 0; i < N; i++) {
            if (corner[i]) { splits.push({ i: i, kind: 'c' }); }
            else if (ext[i] === 1) { splits.push({ i: i, kind: 'x' }); }
            else if (ext[i] === 2) { splits.push({ i: i, kind: 'y' }); }
        }
        if (!closed) {
            if (!splits.length || splits[0].i !== 0) { splits.unshift({ i: 0, kind: 'c' }); }
            if (splits[splits.length - 1].i !== N - 1) { splits.push({ i: N - 1, kind: 'c' }); }
        } else {
            if (splits.length === 0) {
                splits.push({ i: 0, kind: 'm' });
                splits.push({ i: Math.floor(N / 2), kind: 'm' });
            } else if (splits.length === 1) {
                splits.push({ i: (splits[0].i + Math.floor(N / 2)) % N, kind: 'm' });
                splits.sort(function (a, b) { return a.i - b.i; });
            }
        }

        var o2 = { k: k, minRun: opt.minRun };
        var curves = [], segCount = closed ? splits.length : splits.length - 1, s;
        for (s = 0; s < segCount; s++) {
            var sA = splits[s], sB = splits[(s + 1) % splits.length];
            var Q = [], idx = sA.i;
            if (closed) {
                while (true) {
                    Q.push(P[idx]);
                    if (idx === sB.i && Q.length > 1) { break; }
                    idx = (idx + 1) % N;
                }
            } else {
                Q = P.slice(sA.i, sB.i + 1);
            }
            var mm = Q.length - 1;
            var ktS = Math.max(1, Math.min(kt, mm));
            var tA = splitTangent(P, N, closed, sA.i, sA.kind, ktS, true);
            var tB = splitTangent(P, N, closed, sB.i, sB.kind, ktS, false);
            var part = fitSegment(Q, tA, tB, tol, o2);
            for (i = 0; i < part.length; i++) { curves.push(part[i]); }
        }
        return curves;
    }

    function reconstructContour(P, closed, opt) {
        var tol = opt.tol, tries = 0, curves;
        while (true) {
            curves = fitOnce(P, closed, opt, tol);
            if (!curves) { return null; }
            var n = closed ? curves.length : curves.length + 1;
            if (!opt.maxAnchors || n <= opt.maxAnchors || tries >= 16) { break; }
            tol *= 1.3; tries++;
        }
        return { curves: curves, closed: closed };
    }

    function curvesToAnchors(curves, closed) {
        var n = curves.length, out = [], i;
        for (i = 0; i < n; i++) {
            var prev = closed ? curves[(i - 1 + n) % n] : (i > 0 ? curves[i - 1] : null);
            out.push({ a: curves[i][0], r: curves[i][1], l: prev ? prev[2] : curves[i][0] });
        }
        if (!closed) {
            var c = curves[n - 1];
            out.push({ a: c[3], l: c[2], r: c[3] });
        }
        return out;
    }

    // 'smooth' when both handles exist and are collinear, else 'corner'
    function classify(an) {
        var lh = sub(an.l, an.a), rh = sub(an.r, an.a), ll = len(lh), rl = len(rh);
        if (ll < 0.01 || rl < 0.01) { return 'corner'; }
        var cross = Math.abs(lh[0] * rh[1] - lh[1] * rh[0]) / (ll * rl);
        return (dot(lh, rh) < 0 && cross < 0.026) ? 'smooth' : 'corner';
    }

    // ------------------------------------------------------------------
    // Illustrator helpers
    // ------------------------------------------------------------------
    function trySet(obj, prop, val) { try { obj[prop] = val; return true; } catch (e) { return false; } }

    function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }

    function readPath(item) {
        var pts = item.pathPoints, raw = { closed: item.closed, pts: [] }, i;
        for (i = 0; i < pts.length; i++) {
            raw.pts.push({ a: pts[i].anchor, l: pts[i].leftDirection, r: pts[i].rightDirection });
        }
        return raw;
    }

    function writeAnchors(item, anchors, closed) {
        var coords = [], i;
        for (i = 0; i < anchors.length; i++) { coords.push(anchors[i].a); }
        item.setEntirePath(coords);
        item.closed = closed;
        var pts = item.pathPoints;
        for (i = 0; i < anchors.length; i++) {
            pts[i].leftDirection = anchors[i].l;
            pts[i].rightDirection = anchors[i].r;
        }
        for (i = 0; i < anchors.length; i++) {
            if (classify(anchors[i]) === 'smooth') { pts[i].pointType = PointType.SMOOTH; }
        }
    }

    function copyStyle(src, dst) {
        try {
            dst.filled = src.filled;
            if (src.filled) { dst.fillColor = src.fillColor; }
        } catch (e1) { }
        try {
            dst.stroked = src.stroked;
            if (src.stroked) { dst.strokeColor = src.strokeColor; dst.strokeWidth = src.strokeWidth; }
        } catch (e2) { }
    }

    function rebuildPath(src, parent, ctx) {
        var raw = readPath(src);
        if (raw.pts.length < 2) { ctx.stats.skipped++; return null; }
        var b = src.geometricBounds;
        if (ctx.speck > 0 && Math.max(b[2] - b[0], b[1] - b[3]) < ctx.speck && src.closed) {
            ctx.stats.specks++;
            return null;
        }
        var P = sampleRaw(raw, ctx.opt.step);
        var fit = reconstructContour(P, raw.closed, ctx.opt);
        if (!fit) { ctx.stats.skipped++; return null; }
        var anchors = curvesToAnchors(fit.curves, fit.closed);
        var np = parent.pathItems.add();
        writeAnchors(np, anchors, fit.closed);
        ctx.stats.contours++;
        ctx.stats.anchorsIn += raw.pts.length;
        ctx.stats.anchorsOut += anchors.length;
        if (ctx.progress && (ctx.stats.contours % 5 === 0)) {
            ctx.progress.set('Rebuilding curves... ' + ctx.stats.contours + ' contours, ' + ctx.stats.anchorsOut + ' anchors');
        }
        return np;
    }

    function rebuildItem(src, parent, ctx) {
        var t = src.typename, i, np;
        if (t === 'PathItem') {
            np = rebuildPath(src, parent, ctx);
            if (np) {
                if (src.clipping) { trySet(np, 'clipping', true); }
                else { copyStyle(src, np); }
                trySet(np, 'name', src.name);
            }
        } else if (t === 'CompoundPathItem') {
            var cp = parent.compoundPathItems.add(), made = 0;
            for (i = src.pathItems.length - 1; i >= 0; i--) {
                if (rebuildPath(src.pathItems[i], cp, ctx)) { made++; }
            }
            if (made === 0) { try { cp.remove(); } catch (e) { } }
            else { copyStyle(src.pathItems[0], cp.pathItems[0]); trySet(cp, 'name', src.name); }
        } else if (t === 'GroupItem') {
            var ng = parent.groupItems.add();
            trySet(ng, 'name', src.name);
            rebuildChildren(src, ng, ctx);
        } else {
            ctx.stats.unsupported++;
        }
    }

    function rebuildChildren(src, dst, ctx) {
        var items = src.pageItems, i;
        for (i = items.length - 1; i >= 0; i--) { rebuildItem(items[i], dst, ctx); }
    }

    function collectPaths(container, out) {
        var items = container.pageItems, i;
        for (i = 0; i < items.length; i++) {
            var it = items[i], t = it.typename, j;
            if (t === 'PathItem') { out.push(it); }
            else if (t === 'CompoundPathItem') { for (j = 0; j < it.pathItems.length; j++) { out.push(it.pathItems[j]); } }
            else if (t === 'GroupItem') { collectPaths(it, out); }
        }
    }

    function collectByType(container, typename, out) {
        var items = container.pageItems, i;
        for (i = 0; i < items.length; i++) {
            if (items[i].typename === typename) { out.push(items[i]); }
            else if (items[i].typename === 'GroupItem') { collectByType(items[i], typename, out); }
        }
    }

    function uniqueSuffix(doc) {
        var n = 1;
        while (true) {
            var suffix = n === 1 ? '' : ' ' + n, clash = false;
            var names = [LAYER_REF, LAYER_PROD, LAYER_CONS], i;
            for (i = 0; i < names.length; i++) {
                try { doc.layers.getByName(names[i] + suffix); clash = true; } catch (e) { }
            }
            if (!clash) { return suffix; }
            n++;
        }
    }

    function newLayer(doc, name) { var l = doc.layers.add(); l.name = name; return l; }

    function scaleToWidth(item, width) {
        var cur = item.geometricBounds[2] - item.geometricBounds[0];
        if (cur <= 0) { return; }
        var s = width / cur * 100;
        item.resize(s, s, true, true, true, true, s, Transformation.CENTER);
    }

    function Progress(title) {
        this.w = new Window('palette', title);
        this.t = this.w.add('statictext', undefined, 'Starting...');
        this.t.preferredSize.width = 360;
        this.w.show();
    }
    Progress.prototype.set = function (s) { try { this.t.text = s; this.w.update(); } catch (e) { } };
    Progress.prototype.close = function () { try { this.w.close(); } catch (e) { } };

    // ------------------------------------------------------------------
    // construction view
    // ------------------------------------------------------------------
    function niceStep(raw) {
        var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p;
        return (f < 1.5 ? 1 : (f < 3.5 ? 2 : (f < 7.5 ? 5 : 10))) * p;
    }

    // Draws primitives either as one compound path per style (fast) or as individual items.
    function MarkerHost(layer, style) {
        this.layer = layer; this.style = style; this.cp = null; this.single = false; this.n = 0;
    }
    MarkerHost.prototype._style = function (p) {
        var s = this.style;
        p.filled = !!s.fill;
        if (s.fill) { p.fillColor = s.fill; }
        p.stroked = !!s.stroke;
        if (s.stroke) { p.strokeColor = s.stroke; p.strokeWidth = s.width; }
        if (s.dash) { try { p.strokeDashes = s.dash; } catch (e) { } }
    };
    MarkerHost.prototype._make = function (kind, a, b, c, d, rev) {
        var coll;
        if (!this.single) {
            if (!this.cp) { this.cp = this.layer.compoundPathItems.add(); }
            coll = this.cp.pathItems;
        } else { coll = this.layer.pathItems; }
        var p;
        if (kind === 'rect') { p = coll.rectangle(a, b, c, d, !!rev); }
        else if (kind === 'ell') { p = coll.ellipse(a, b, c, d); }
        else { p = coll.add(); p.setEntirePath([a, b]); }
        return p;
    };
    MarkerHost.prototype.add = function (kind, a, b, c, d, rev) {
        var p;
        try { p = this._make(kind, a, b, c, d, rev); }
        catch (e) { this.single = true; p = this._make(kind, a, b, c, d, rev); }
        this.n++;
        if (this.single) { this._style(p); }
        else if (this.n === 1) { this._style(this.cp.pathItems[0]); }
        return p;
    };
    MarkerHost.prototype.rect = function (cx, cy, size) { return this.add('rect', cy + size / 2, cx - size / 2, size, size, false); };
    MarkerHost.prototype.circle = function (cx, cy, size) { return this.add('ell', cy + size / 2, cx - size / 2, size, size, false); };
    MarkerHost.prototype.line = function (p, q) { return this.add('line', p, q); };

    function addSub(parent, name) { var l = parent.layers.add(); l.name = name; return l; }

    function lineStyle(color, width, dash) { return { fill: null, stroke: color, width: width, dash: dash }; }

    function buildGrid(sub, L, T, R, B, cfg, maxDim, ink) {
        var step = cfg.gridStep > 0 ? cfg.gridStep : niceStep(maxDim / 24);
        var pad = step * 2, guard = 0;
        var x0 = Math.floor((L - pad) / step) * step, x1 = Math.ceil((R + pad) / step) * step;
        var y0 = Math.floor((B - pad) / step) * step, y1 = Math.ceil((T + pad) / step) * step;
        while (((x1 - x0) / step > 160 || (y1 - y0) / step > 160) && guard < 6) { step *= 2; guard++; x0 = Math.floor((L - pad) / step) * step; x1 = Math.ceil((R + pad) / step) * step; y0 = Math.floor((B - pad) / step) * step; y1 = Math.ceil((T + pad) / step) * step; }
        var minor = new MarkerHost(sub, lineStyle(rgb(222, 222, 222), ink * 0.5, null));
        var major = new MarkerHost(sub, lineStyle(rgb(190, 190, 190), ink * 0.8, null));
        var x, y, n;
        for (x = x0, n = 0; x <= x1 + step * 0.01; x += step, n++) {
            (n % 5 === 0 ? major : minor).line([x, y0], [x, y1]);
        }
        for (y = y0, n = 0; y <= y1 + step * 0.01; y += step, n++) {
            (n % 5 === 0 ? major : minor).line([x0, y], [x1, y]);
        }
    }

    function guideLine(sub, p, q) {
        var g = sub.pathItems.add();
        g.setEntirePath([p, q]);
        g.guides = true;
    }

    function clusterLevels(levels, tol) {
        levels.sort(function (a, b) { return a - b; });
        var out = [], i = 0;
        while (i < levels.length) {
            var j = i, sum = levels[i];
            while (j + 1 < levels.length && levels[j + 1] - levels[j] <= tol) { j++; sum += levels[j]; }
            if (j > i) { out.push(sum / (j - i + 1)); }
            i = j + 1;
        }
        return out;
    }

    function buildGuides(sub, L, T, R, B, anchorsAll, maxDim) {
        var pad = maxDim * 0.08, i;
        var cx = (L + R) / 2, cy = (T + B) / 2;
        var xs = [L, R, cx], ys = [T, B, cy];
        var ex = [], ey = [];
        for (i = 0; i < anchorsAll.length; i++) {
            var an = anchorsAll[i];
            var h = len(sub2(an.r, an.a)) > 0.01 ? sub2(an.r, an.a) : sub2(an.a, an.l);
            var hl = len(h);
            if (hl < 0.01 || classify(an) !== 'smooth') { continue; }
            if (Math.abs(h[1]) < 0.02 * hl) { ey.push(an.a[1]); }
            else if (Math.abs(h[0]) < 0.02 * hl) { ex.push(an.a[0]); }
        }
        var cl = clusterLevels(ex, maxDim * 0.002), j;
        for (j = 0; j < cl.length && j < 14; j++) { xs.push(cl[j]); }
        cl = clusterLevels(ey, maxDim * 0.002);
        for (j = 0; j < cl.length && j < 14; j++) { ys.push(cl[j]); }
        for (i = 0; i < xs.length; i++) { guideLine(sub, [xs[i], B - pad], [xs[i], T + pad]); }
        for (i = 0; i < ys.length; i++) { guideLine(sub, [L - pad, ys[i]], [R + pad, ys[i]]); }
    }
    function sub2(a, b) { return [a[0] - b[0], a[1] - b[1]]; }

    function addLabel(layer, text, cx, cy, size, color) {
        try {
            var tf = layer.textFrames.add();
            tf.contents = text;
            tf.textRange.characterAttributes.size = size;
            tf.textRange.characterAttributes.fillColor = color;
            tf.textRange.paragraphAttributes.justification = Justification.CENTER;
            tf.left = cx - tf.width / 2;
            tf.top = cy + tf.height / 2;
            try { tf.createOutline(); } catch (e) { }
        } catch (e2) { }
    }

    // Clearspace grid: x-module zone around the artwork bounds.
    function buildClearspace(sub, L, T, R, B, cfg) {
        var W = R - L, H = T - B;
        var basis = cfg.csBasis === 1 ? W : (cfg.csBasis === 2 ? Math.min(W, H) : H);
        var x = basis * cfg.csPct / 100;
        if (!(x > 0)) { return 0; }
        var maxDim = Math.max(W, H);
        var ink = clamp(maxDim * 0.0006, 0.4, 1.2);
        var accent = rgb(214, 51, 108);
        var tint = rgb(250, 214, 226);
        var oL = L - x, oR = R + x, oT = T + x, oB = B - x;

        // tinted zone = outer rectangle minus the artwork bounds
        var zone = new MarkerHost(sub, { fill: tint, stroke: null, width: 0, dash: null });
        zone.add('rect', oT, oL, oR - oL, oT - oB, false);
        zone.add('rect', T, L, W, H, true);
        try { zone.cp.opacity = 55; } catch (e0) { }

        // x-module grid inside the zone
        if (cfg.csGrid && (oR - oL) / x < 200 && (oT - oB) / x < 200) {
            var g = new MarkerHost(sub, lineStyle(accent, ink * 0.35, null));
            var px, py;
            for (px = oL; px <= oR + x * 0.01; px += x) { g.line([px, oB], [px, oT]); }
            g.line([R, oB], [R, oT]);
            for (py = oB; py <= oT + x * 0.01; py += x) { g.line([oL, py], [oR, py]); }
            g.line([oL, B], [oR, B]);
            g.line([oL, T], [oR, T]);
        }

        // boundaries
        var inner = new MarkerHost(sub, lineStyle(rgb(30, 30, 30), ink, null));
        inner.add('rect', T, L, W, H, false);
        var outer = new MarkerHost(sub, lineStyle(accent, ink * 1.2, [6, 4]));
        outer.add('rect', oT, oL, oR - oL, oT - oB, false);

        // x squares: 4 corners + 4 side midpoints
        var sq = new MarkerHost(sub, { fill: rgb(255, 255, 255), stroke: accent, width: ink, dash: null });
        var cxm = (L + R) / 2, cym = (T + B) / 2;
        var spots = [
            [oL + x / 2, oT - x / 2], [oR - x / 2, oT - x / 2], [oL + x / 2, oB + x / 2], [oR - x / 2, oB + x / 2],
            [cxm, T + x / 2], [cxm, B - x / 2], [L - x / 2, cym], [R + x / 2, cym]
        ];
        var i;
        for (i = 0; i < spots.length; i++) { sq.rect(spots[i][0], spots[i][1], x); }
        if (cfg.csLabels) {
            for (i = 0; i < spots.length; i++) { addLabel(sub, 'x', spots[i][0], spots[i][1], x * 0.45, accent); }
        }
        return x;
    }

    function buildConstruction(doc, prodLayer, root, consLayer, cfg, progress) {
        var paths = [], i, j;
        collectPaths(root, paths);
        var gb = root.geometricBounds;
        var L = gb[0], T = gb[1], R = gb[2], B = gb[3];
        var maxDim = Math.max(R - L, T - B);
        var ink = clamp(maxDim * 0.0005, 0.35, 1);
        var dark = rgb(25, 25, 25), mid = rgb(70, 70, 70), white = rgb(255, 255, 255);
        var msize = clamp(maxDim * 0.006, 2.5, 9);

        var subClear = cfg.clearspace ? addSub(consLayer, 'Clearspace') : null;
        var subGrid = cfg.grid ? addSub(consLayer, 'Grid') : null;
        var subGuides = cfg.guides ? addSub(consLayer, 'Guides') : null;
        var subOutline = cfg.anchors ? addSub(consLayer, 'Outline') : null;
        var subHL = cfg.anchors ? addSub(consLayer, 'Handle lines') : null;
        var subHE = cfg.anchors ? addSub(consLayer, 'Handle ends') : null;
        var subAn = cfg.anchors ? addSub(consLayer, 'Anchors') : null;

        var all = [], data = [];
        for (i = 0; i < paths.length; i++) {
            var raw = readPath(paths[i]), an = [];
            for (j = 0; j < raw.pts.length; j++) { an.push(raw.pts[j]); all.push(raw.pts[j]); }
            data.push({ anchors: an, closed: raw.closed });
        }

        if (subClear) { progress.set('Clearspace grid...'); buildClearspace(subClear, L, T, R, B, cfg); }
        if (subGrid) { progress.set('Grid...'); buildGrid(subGrid, L, T, R, B, cfg, maxDim, ink); }
        if (subGuides) { progress.set('Guides...'); buildGuides(subGuides, L, T, R, B, all, maxDim); }

        if (cfg.anchors) {
            progress.set('Anchors and handles...');
            var hLine = new MarkerHost(subHL, lineStyle(mid, ink * 0.6, null));
            var hEnd = new MarkerHost(subHE, { fill: white, stroke: dark, width: ink * 0.8, dash: null });
            var aSmooth = new MarkerHost(subAn, { fill: white, stroke: dark, width: ink, dash: null });
            var aCorner = new MarkerHost(subAn, { fill: dark, stroke: dark, width: ink, dash: null });
            for (i = 0; i < data.length; i++) {
                var o = subOutline.pathItems.add();
                writeAnchors(o, data[i].anchors, data[i].closed);
                o.filled = false; o.stroked = true; o.strokeColor = dark; o.strokeWidth = ink;
                for (j = 0; j < data[i].anchors.length; j++) {
                    var p = data[i].anchors[j], hs = [p.l, p.r], h;
                    for (h = 0; h < 2; h++) {
                        if (dist(hs[h], p.a) > 0.05) {
                            hLine.line(p.a, hs[h]);
                            hEnd.circle(hs[h][0], hs[h][1], msize * 0.8);
                        }
                    }
                    (classify(p) === 'smooth' ? aSmooth : aCorner).rect(p.a[0], p.a[1], msize);
                }
            }
        }
        consLayer.locked = true;
    }

    function selectAnchors(doc, root) {
        var paths = [], i, j;
        collectPaths(root, paths);
        try { doc.selection = null; } catch (e) { }
        for (i = 0; i < paths.length; i++) {
            try {
                paths[i].selected = true;
                var pts = paths[i].pathPoints;
                for (j = 0; j < pts.length; j++) { pts[j].selected = PathPointSelection.ANCHORPOINT; }
            } catch (e2) { }
        }
    }

    // ------------------------------------------------------------------
    // export
    // ------------------------------------------------------------------
    function doExports(doc, cfg, layers, baseName) {
        var done = [], folder = new Folder(cfg.exportFolder);
        if (!folder.exists) { folder.create(); }
        var vis = {}, k;
        var keys = ['ref', 'cons'];
        for (k = 0; k < keys.length; k++) {
            if (layers[keys[k]]) { vis[keys[k]] = layers[keys[k]].visible; }
        }
        var prevPreview = true;
        try { prevPreview = layers.prod.preview; layers.prod.preview = true; } catch (e0) { }
        if (layers.ref) { layers.ref.visible = false; }
        if (layers.cons) { layers.cons.visible = cfg.exportCons; }
        try {
            if (cfg.exportSVG) {
                try {
                    var f1 = new File(folder.fsName + '/' + baseName + '.svg');
                    var so = new ExportOptionsSVG();
                    trySet(so, 'embedRasterImages', false);
                    trySet(so, 'fontType', SVGFontType.OUTLINEFONT);
                    trySet(so, 'coordinatePrecision', 3);
                    doc.exportFile(f1, ExportType.SVG, so);
                    done.push(f1.fsName);
                } catch (e1) { done.push('SVG failed: ' + e1.message); }
            }
            if (cfg.exportPDF) {
                try {
                    var f2 = new File(folder.fsName + '/' + baseName + '.pdf');
                    var po = new PDFSaveOptions();
                    trySet(po, 'preserveEditability', true);
                    doc.saveAs(f2, po);
                    done.push(f2.fsName);
                } catch (e2) { done.push('PDF failed: ' + e2.message); }
            }
        } finally {
            if (layers.ref) { layers.ref.visible = vis.ref; }
            if (layers.cons) { layers.cons.visible = vis.cons; }
            try { layers.prod.preview = prevPreview; } catch (e3) { }
        }
        if (cfg.exportAI) {
            try {
                var f3 = new File(folder.fsName + '/' + baseName + '.ai');
                var ao = new IllustratorSaveOptions();
                trySet(ao, 'pdfCompatible', true);
                doc.saveAs(f3, ao);
                done.push(f3.fsName);
            } catch (e4) { done.push('AI failed: ' + e4.message); }
        }
        return done;
    }

    // ------------------------------------------------------------------
    // dialog
    // ------------------------------------------------------------------
    var TRACE_PRESETS = [
        { label: 'Black & white logo', preset: '[Black and White Logo]', bw: true },
        { label: 'Silhouette', preset: '[Silhouettes]', bw: true },
        { label: '3 colors', preset: '[3 Colors]', bw: false },
        { label: '6 colors', preset: '[6 Colors]', bw: false },
        { label: '16 colors', preset: '[16 Colors]', bw: false }
    ];
    var UNITS = [['px', 1], ['pt', 1], ['mm', 2.834645669], ['cm', 28.34645669], ['in', 72]];

    function analyzeSelection(doc) {
        var info = { kind: 'none', desc: 'nothing selected', count: 0 };
        if (!doc) { return info; }
        var sel = doc.selection, r = 0, v = 0, i;
        if (!sel || !sel.length || sel.typename === 'TextRange') { return info; }
        for (i = 0; i < sel.length; i++) {
            var t = sel[i].typename;
            if (t === 'RasterItem' || t === 'PlacedItem') { r++; } else { v++; }
        }
        info.count = sel.length;
        if (r && !v) { info.kind = 'raster'; info.desc = r + ' image(s)'; }
        else if (v) { info.kind = 'vector'; info.desc = v + ' vector object(s)'; }
        return info;
    }

    function showDialog(sel, hasDoc) {
        var w = new Window('dialog', NAME + ' ' + VERSION);
        w.orientation = 'column'; w.alignChildren = 'fill';

        function check(parent, label, val) { var c = parent.add('checkbox', undefined, label); c.value = val; return c; }
        function edit(parent, label, val, chars, lw) {
            var g = parent.add('group'); var st = g.add('statictext', undefined, label);
            if (lw) { st.preferredSize.width = lw; }
            var e = g.add('edittext', undefined, String(val)); e.characters = chars || 6; return e;
        }
        function slider(parent, label, min, max, val, lw) {
            var g = parent.add('group'); var st = g.add('statictext', undefined, label); st.preferredSize.width = lw || 170;
            var s = g.add('slider', undefined, val, min, max); s.preferredSize.width = 170;
            var t = g.add('statictext', undefined, String(Math.round(val))); t.preferredSize.width = 36;
            s.onChanging = function () { t.text = String(Math.round(s.value)); };
            return s;
        }
        function panel(title) { var p = w.add('panel', undefined, title); p.orientation = 'column'; p.alignChildren = 'left'; return p; }

        // 1 source
        var pS = panel('1. Source');
        var rSel = pS.add('radiobutton', undefined, 'Use current selection  (' + sel.desc + ')');
        var rFile = pS.add('radiobutton', undefined, 'Import image file (PNG / JPG / ...)');
        var gF = pS.add('group'); gF.margins = [20, 0, 0, 0];
        var eFile = gF.add('edittext', undefined, ''); eFile.characters = 38;
        var bFile = gF.add('button', undefined, 'Browse...');

        // 2 method
        var pM = panel('2. Method');
        var rTrace = pM.add('radiobutton', undefined, 'Auto-trace raster logo, then rebuild clean Bezier curves');
        var rClean = pM.add('radiobutton', undefined, 'Clean up / rebuild existing vector paths');
        var rView = pM.add('radiobutton', undefined, 'Only rebuild the construction view from the Production layer');
        var gT = pM.add('group'); gT.margins = [20, 0, 0, 0];
        gT.add('statictext', undefined, 'Trace preset:');
        var dPre = gT.add('dropdownlist', undefined, (function () { var a = [], i; for (i = 0; i < TRACE_PRESETS.length; i++) { a.push(TRACE_PRESETS[i].label); } return a; })());
        dPre.selection = 0;
        var cIgn = gT.add('checkbox', undefined, 'Ignore white'); cIgn.value = true;
        var sThr = slider(pM, '      Threshold (B&W)', 1, 254, 128, 170);

        // 3 size
        var pZ = panel('3. Output size');
        var gZ = pZ.add('group');
        var cRes = gZ.add('checkbox', undefined, 'Resize to width'); cRes.value = true;
        var eW = gZ.add('edittext', undefined, '1000'); eW.characters = 7;
        var dU = gZ.add('dropdownlist', undefined, ['px', 'pt', 'mm', 'cm', 'in']); dU.selection = 0;

        // 4 curves
        var pC = panel('4. Curve quality');
        var sSm = slider(pC, 'Tolerance (1 = exact, 10 = loose)', 1, 10, 3, 210);
        var sAng = slider(pC, 'Corner sensitivity (deg)', 15, 90, 40, 210);
        var eMax = edit(pC, 'Max anchors per shape (0 = auto):', 0, 5, 210);
        var cSnap = check(pC, 'Anchors on horizontal / vertical extrema (axis-aligned handles)', true);
        var cSpeck = check(pC, 'Remove stray specks', true);
        var cTxt = check(pC, 'Convert live text to outlines first', true);

        // 5 output / construction
        var pO = panel('5. Layers and construction view (optional presentation)');
        var cPres = check(pO, 'Preserve original artwork (dimmed Reference layer, original hidden)', true);
        var cAn = check(pO, 'Anchors, direction handles and thin outlines', true);
        var cGrid = check(pO, 'Grid', true);
        var eGrid = edit(pO, '     Grid step (0 = auto):', 0, 6, 150);
        var cGd = check(pO, 'Alignment guides (bounds, centre, shared extrema)', true);
        var cCs = check(pO, 'Clearspace grid (x-module)', true);
        var gCs = pO.add('group'); gCs.margins = [20, 0, 0, 0];
        gCs.add('statictext', undefined, 'x =');
        var eCs = gCs.add('edittext', undefined, '25'); eCs.characters = 4;
        gCs.add('statictext', undefined, '% of logo');
        var dCs = gCs.add('dropdownlist', undefined, ['height', 'width', 'shorter side']); dCs.selection = 0;
        var cCsG = gCs.add('checkbox', undefined, 'x-grid'); cCsG.value = true;
        var cCsL = gCs.add('checkbox', undefined, 'labels'); cCsL.value = true;
        var cOut = check(pO, 'Show Production layer in Outline mode while inspecting', true);
        var cSelA = check(pO, 'Select all anchors at the end (shows native handles)', true);

        // 6 export
        var pE = panel('6. Export (optional)');
        var gE = pE.add('group');
        var cAI = gE.add('checkbox', undefined, 'AI'); var cSVG = gE.add('checkbox', undefined, 'SVG'); var cPDF = gE.add('checkbox', undefined, 'PDF');
        var cEC = gE.add('checkbox', undefined, 'include construction view');
        var gEF = pE.add('group');
        var eFold = gEF.add('edittext', undefined, ''); eFold.characters = 38;
        var bFold = gEF.add('button', undefined, 'Folder...');
        try { eFold.text = (hasDoc && app.activeDocument.saved) ? app.activeDocument.path.fsName : Folder.desktop.fsName; } catch (e0) { eFold.text = Folder.desktop.fsName; }

        var gB = w.add('group'); gB.alignment = 'right';
        var bGo = gB.add('button', undefined, 'Build', { name: 'ok' });
        gB.add('button', undefined, 'Cancel', { name: 'cancel' });

        function refresh() {
            var view = rView.value;
            eFile.enabled = bFile.enabled = rFile.value && !view;
            rSel.enabled = rFile.enabled = !view;
            rClean.enabled = !rFile.value;
            if (rFile.value && rClean.value) { rTrace.value = true; rClean.value = false; }
            var tr = rTrace.value;
            dPre.enabled = cIgn.enabled = tr;
            sThr.enabled = tr && TRACE_PRESETS[dPre.selection.index].bw;
            pZ.enabled = pC.enabled = !view;
            cPres.enabled = !view;
            eGrid.enabled = cGrid.value;
            gCs.enabled = cCs.value;
        }
        rSel.onClick = rFile.onClick = rTrace.onClick = rClean.onClick = rView.onClick = refresh;
        dPre.onChange = cGrid.onClick = cCs.onClick = refresh;

        bFile.onClick = function () {
            var f = (File.fs === 'Windows')
                ? File.openDialog('Select logo image', 'Images:*.png;*.jpg;*.jpeg;*.gif;*.bmp;*.tif;*.tiff;*.psd;*.webp')
                : File.openDialog('Select logo image', function (x) { return (x instanceof Folder) || /\.(png|jpe?g|gif|bmp|tiff?|psd|webp)$/i.test(x.name); });
            if (f) { eFile.text = f.fsName; rFile.value = true; rSel.value = false; refresh(); }
        };
        bFold.onClick = function () { var f = Folder.selectDialog('Export folder'); if (f) { eFold.text = f.fsName; } };

        if (sel.kind === 'none') { rFile.value = true; rTrace.value = true; cRes.value = true; }
        else if (sel.kind === 'raster') { rSel.value = true; rTrace.value = true; }
        else { rSel.value = true; rClean.value = true; cRes.value = false; }
        refresh();

        var result = null;
        bGo.onClick = function () {
            var wv = parseFloat(eW.text), view = rView.value;
            if (!view && rFile.value && !(new File(eFile.text)).exists) { alert('Please choose an existing image file.'); return; }
            if (!view && rSel.value && sel.kind === 'none') { alert('Nothing is selected. Select a logo or choose an image file.'); return; }
            if (!view && cRes.value && !(wv > 0)) { alert('Enter a valid output width.'); return; }
            result = {
                source: rFile.value ? 'file' : 'sel',
                filePath: eFile.text,
                method: view ? 'view' : (rTrace.value ? 'trace' : 'clean'),
                preset: TRACE_PRESETS[dPre.selection.index],
                threshold: Math.round(sThr.value),
                ignoreWhite: cIgn.value,
                resize: cRes.value,
                width: wv * UNITS[dU.selection.index][1],
                smooth: sSm.value,
                cornerAngle: sAng.value,
                maxAnchors: Math.max(0, Math.round(parseFloat(eMax.text) || 0)),
                snap: cSnap.value,
                despeckle: cSpeck.value,
                outlineText: cTxt.value,
                preserve: cPres.value,
                anchors: cAn.value,
                grid: cGrid.value,
                gridStep: Math.max(0, parseFloat(eGrid.text) || 0),
                guides: cGd.value,
                clearspace: cCs.value,
                csPct: clamp(parseFloat(eCs.text) || 25, 1, 200),
                csBasis: dCs.selection.index,
                csGrid: cCsG.value,
                csLabels: cCsL.value,
                outlineMode: cOut.value,
                selectAnchors: cSelA.value,
                exportAI: cAI.value, exportSVG: cSVG.value, exportPDF: cPDF.value,
                exportCons: cEC.value,
                exportFolder: eFold.text
            };
            w.close(1);
        };
        return w.show() === 1 ? result : null;
    }

    // ------------------------------------------------------------------
    // main workflow
    // ------------------------------------------------------------------
    function configureTrace(plugin, cfg) {
        var o = plugin.tracing.tracingOptions;
        try { o.loadFromPreset(cfg.preset.preset); } catch (e) { }
        if (cfg.preset.bw) {
            trySet(o, 'tracingMode', TracingModeType.TRACINGMODEBLACKANDWHITE);
            trySet(o, 'threshold', cfg.threshold);
        }
        trySet(o, 'ignoreWhite', cfg.ignoreWhite);
        trySet(o, 'fills', true);
        trySet(o, 'strokes', false);
        trySet(o, 'pathFidelity', 90);
        trySet(o, 'cornerFidelity', 75);
        trySet(o, 'noiseFidelity', 8);
        trySet(o, 'snapCurvesToLines', false);
    }

    function run(cfg, progress) {
        var doc, created = false, i;
        var ctxStats = { contours: 0, anchorsIn: 0, anchorsOut: 0, specks: 0, skipped: 0, unsupported: 0 };

        // ---- view-only mode -------------------------------------------------
        if (cfg.method === 'view') {
            doc = app.activeDocument;
            var pl = null, name;
            for (i = 0; i < doc.layers.length; i++) {
                name = doc.layers[i].name;
                if (name.indexOf(LAYER_PROD) === 0) { pl = doc.layers[i]; break; }
            }
            if (!pl) { throw new Error('No "' + LAYER_PROD + '" layer found in this document.'); }
            var suffix = pl.name.substr(LAYER_PROD.length);
            try { var old = doc.layers.getByName(LAYER_CONS + suffix); old.locked = false; old.remove(); } catch (e0) { }
            var rt = null, tops = pl.groupItems;
            for (i = 0; i < tops.length; i++) { if (tops[i].name === ROOT_NAME) { rt = tops[i]; break; } }
            if (!rt) {
                rt = pl.groupItems.add(); rt.name = ROOT_NAME;
                var kids = [], q;
                for (q = 0; q < pl.pageItems.length; q++) { if (pl.pageItems[q] !== rt) { kids.push(pl.pageItems[q]); } }
                for (q = 0; q < kids.length; q++) { if (kids[q].typename !== 'GroupItem' || kids[q].name !== ROOT_NAME) { try { kids[q].move(rt, ElementPlacement.PLACEATEND); } catch (e1) { } } }
            }
            var cl = newLayer(doc, LAYER_CONS + suffix);
            buildConstruction(doc, pl, rt, cl, cfg, progress);
            if (cfg.outlineMode) { trySet(pl, 'preview', false); }
            return { message: 'Construction view rebuilt.', doc: doc };
        }

        // ---- document -------------------------------------------------------
        if (app.documents.length === 0) {
            if (cfg.source !== 'file') { throw new Error('No document is open.'); }
            doc = app.documents.add(DocumentColorSpace.RGB, 1200, 1200);
            created = true;
        } else { doc = app.activeDocument; }

        var sfx = uniqueSuffix(doc);
        var refLayer = null;
        var origSel = [];
        if (cfg.source === 'sel') { for (i = 0; i < doc.selection.length; i++) { origSel.push(doc.selection[i]); } }
        var wantRef = cfg.preserve;
        if (wantRef) { refLayer = newLayer(doc, LAYER_REF + sfx); }
        var prodLayer = newLayer(doc, LAYER_PROD + sfx);
        doc.activeLayer = prodLayer;
        try { doc.selection = null; } catch (e2) { }

        var source = null;        // group holding the dense geometry to rebuild
        var baseName = 'logo';

        if (cfg.method === 'trace') {
            progress.set('Preparing image...');
            var img;
            if (cfg.source === 'file') {
                var file = new File(cfg.filePath);
                img = doc.placedItems.add();
                img.file = file;
                baseName = decodeURI(file.name).replace(/\.[^\.]+$/, '');
            } else {
                var r = null;
                for (i = 0; i < origSel.length; i++) {
                    if (origSel[i].typename === 'RasterItem' || origSel[i].typename === 'PlacedItem') { r = origSel[i]; break; }
                }
                if (!r) { throw new Error('The selection contains no image to trace.'); }
                img = r.duplicate(prodLayer, ElementPlacement.PLACEATBEGINNING);
                baseName = 'logo';
            }
            if (cfg.resize) { scaleToWidth(img, cfg.width); }
            if (created) {
                var ib = img.geometricBounds, m = Math.max(ib[2] - ib[0], ib[1] - ib[3]) * 0.35;
                doc.artboards[0].artboardRect = [ib[0] - m, ib[1] + m, ib[2] + m, ib[3] - m];
            } else if (cfg.source === 'file') {
                var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
                img.left = ab[0] + ((ab[2] - ab[0]) - img.width) / 2;
                img.top = ab[1] - ((ab[1] - ab[3]) - img.height) / 2;
            }
            if (wantRef) {
                var rc = img.duplicate(refLayer, ElementPlacement.PLACEATBEGINNING);
                try { if (rc.typename === 'PlacedItem') { rc.embed(); } } catch (e3) { }
                trySet(rc, 'opacity', 35);
            }
            progress.set('Running Image Trace...');
            var plugin = img.trace();
            configureTrace(plugin, cfg);
            app.redraw();
            source = plugin.tracing.expandTracing();
            if (!source) { throw new Error('Image Trace did not return vector artwork.'); }
        } else {
            progress.set('Copying artwork...');
            source = prodLayer.groupItems.add();
            source.name = '_working copy';
            var rg = wantRef ? refLayer.groupItems.add() : null;
            for (i = 0; i < origSel.length; i++) {
                var t = origSel[i].typename;
                if (t === 'RasterItem' || t === 'PlacedItem') { ctxStats.unsupported++; continue; }
                try {
                    origSel[i].duplicate(source, ElementPlacement.PLACEATEND);
                    if (rg) { origSel[i].duplicate(rg, ElementPlacement.PLACEATEND); }
                } catch (e4) { ctxStats.skipped++; }
            }
            if (rg) { rg.name = 'Original copy'; trySet(rg, 'opacity', 35); }
            if (!source.pageItems.length) { throw new Error('Nothing usable was selected.'); }
            // expand live traces
            var plugins = []; collectByType(source, 'PluginItem', plugins);
            for (i = 0; i < plugins.length; i++) { try { plugins[i].tracing.expandTracing(); } catch (e5) { } }
            if (cfg.outlineText) {
                var tfs = []; collectByType(source, 'TextFrame', tfs);
                for (i = 0; i < tfs.length; i++) { try { tfs[i].createOutline(); } catch (e6) { ctxStats.skipped++; } }
            }
            if (cfg.resize) { scaleToWidth(source, cfg.width); }
        }

        // ---- metrics --------------------------------------------------------
        var gb = source.geometricBounds;
        var maxDim = Math.max(gb[2] - gb[0], gb[1] - gb[3]);
        if (!(maxDim > 0)) { throw new Error('The artwork has no size.'); }
        var tol = maxDim * 0.0004 * cfg.smooth;
        var opt = {
            tol: tol,
            step: Math.max(tol * 0.75, maxDim / 700),
            cornerWin: maxDim * 0.012,
            cornerAng: cfg.cornerAngle * Math.PI / 180,
            snap: cfg.snap,
            maxAnchors: cfg.maxAnchors,
            minRun: Math.max(maxDim * 0.06, tol * 8)
        };
        var ctx = { opt: opt, speck: cfg.despeckle ? maxDim * 0.004 : 0, stats: ctxStats, progress: progress };

        // ---- rebuild --------------------------------------------------------
        progress.set('Rebuilding curves...');
        var root = prodLayer.groupItems.add();
        root.name = ROOT_NAME;
        rebuildChildren(source, root, ctx);
        try { source.remove(); } catch (e7) { }
        if (!root.pageItems.length) { throw new Error('No paths were produced. Try another threshold or preset.'); }

        // original handling
        if (cfg.source === 'sel') {
            for (i = 0; i < origSel.length; i++) {
                try {
                    if (cfg.preserve) { origSel[i].hidden = true; } else { origSel[i].remove(); }
                } catch (e8) { }
            }
        }
        if (refLayer) { refLayer.locked = true; }

        // ---- construction ---------------------------------------------------
        var consLayer = null;
        if (cfg.anchors || cfg.grid || cfg.guides || cfg.clearspace) {
            consLayer = newLayer(doc, LAYER_CONS + sfx);
            buildConstruction(doc, prodLayer, root, consLayer, cfg, progress);
        }
        if (cfg.outlineMode && consLayer) { trySet(prodLayer, 'preview', false); }
        doc.activeLayer = prodLayer;
        if (cfg.selectAnchors) { selectAnchors(doc, root); }

        // ---- export ---------------------------------------------------------
        var exported = [];
        if (cfg.exportAI || cfg.exportSVG || cfg.exportPDF) {
            progress.set('Exporting...');
            exported = doExports(doc, cfg, { ref: refLayer, prod: prodLayer, cons: consLayer }, baseName);
        }

        var msg = 'Done.\n\nContours rebuilt: ' + ctxStats.contours +
            '\nAnchors: ' + ctxStats.anchorsIn + '  ->  ' + ctxStats.anchorsOut;
        if (ctxStats.specks) { msg += '\nSpecks removed: ' + ctxStats.specks; }
        if (ctxStats.unsupported) { msg += '\nUnsupported objects skipped: ' + ctxStats.unsupported; }
        if (exported.length) { msg += '\n\nExported:\n' + exported.join('\n'); }
        msg += '\n\nProduction paths are selected - use the Direct Selection tool (A) to edit.' +
            '\nThe Construction View layer is locked; hide or delete it when you only need the clean logo.';
        return { message: msg, doc: doc };
    }

    function main() {
        var hasDoc = app.documents.length > 0;
        var sel = analyzeSelection(hasDoc ? app.activeDocument : null);
        var cfg = showDialog(sel, hasDoc);
        if (!cfg) { return; }
        var prevCoord = app.coordinateSystem;
        try { app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM; } catch (e0) { }
        var progress = new Progress(NAME);
        var res = null, err = null;
        try { res = run(cfg, progress); }
        catch (e) { err = e; }
        progress.close();
        try { app.coordinateSystem = prevCoord; } catch (e1) { }
        try { app.redraw(); } catch (e2) { }
        if (err) { alert(NAME + ' - error\n\n' + err.message + (err.line ? '\n(line ' + err.line + ')' : '')); }
        else if (res) { alert(res.message); }
    }

    return {
        main: main,
        sampleRaw: sampleRaw,
        reconstructContour: reconstructContour,
        curvesToAnchors: curvesToAnchors,
        classify: classify
    };
})();

if (typeof app !== 'undefined' && typeof app.documents !== 'undefined') { LC.main(); }
