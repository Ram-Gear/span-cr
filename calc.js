/* Span CR calculation engine - a cell-for-cell port of Roger Blake's
   "B&S TO SPAN & CR" spreadsheet (Sheet1, rev. 25 AUG 08).
   Constants are kept exactly as in the sheet (PI = 3.141592654, deg->rad 0.017453293,
   rad->deg 57.29577951) so results match the spreadsheet bit-for-bit. */
(function (root) {
  const PI = 3.141592654, D2R = 0.017453293, R2D = 57.29577951;
  function calc(inp) {
    const C9 = inp.N, C10 = inp.DPT, C11 = inp.PAT, C12 = inp.HA, C13 = inp.OD,
          C14 = inp.CA, C15 = inp.CTmin, C16 = inp.CTmax;
    const r = {};
    // left column (gear basics)
    r.C37 = 0.8 / C10;                     // std addendum
    r.C38 = C9 / C10;                      // PD
    r.C47 = Math.cos(C11 * D2R);           // cos PAT
    r.C39 = C9 / C10 * r.C47;              // BD
    r.C40 = Math.tan(C12 * D2R);           // tan HA
    r.C41 = Math.cos(C12 * D2R);           // cos HA
    r.C43 = PI * r.C47 / C10;              // BPT
    r.C46 = Math.sin(C11 * D2R);           // sin PAT
    r.C48 = Math.tan(C11 * D2R);           // tan PAT
    r.C22 = Math.atan(r.C48 * r.C41) * R2D;// PAN
    r.C45 = Math.sin(r.C22 * D2R);         // sin PAN
    r.C49 = r.C48 - C11 * D2R;             // inv PAT
    r.C50 = r.C45 / r.C46;                 // cos BHA
    r.C23 = (PI * r.C47 / C10) * r.C50;    // BPN
    r.C51 = PI / 2;
    r.C52 = (C13 - r.C38) / 2;
    r.C53 = r.C38 / C9;
    r.C54 = 2 * r.C48 * C10;
    r.C55 = Math.acos(r.C50) * R2D;        // BHA
    r.C56 = Math.sin(r.C55 * D2R);         // sin BHA
    r.E48 = 2 * Math.sqrt((r.C38 / 2) ** 2 - (r.C39 / 2) ** 2);
    // I = min CT (C15), J = max CT (C16)
    const col = (CT) => {
      const o = {};
      o.r36 = C13 / 2 - C14;
      o.r37 = 2 * Math.sqrt(o.r36 ** 2 + (CT / 2) ** 2);   // D' at B&S T
      o.r38 = o.r37 / 2;
      o.r39 = (o.r37 - C13) / 2 + C14;                      // h
      o.r40 = CT / o.r37;
      o.r41 = 2 * (Math.asin(o.r40) * R2D);                 // angle a
      o.r42 = o.r38 * o.r41 * D2R;                          // CTTN at D'
      o.r43 = o.r42 / 2;
      o.r47 = o.r37 / r.C38;
      o.r48 = Math.atan(r.C40 * o.r47) * R2D;               // HA at D'
      o.r49 = Math.cos(o.r48 * D2R);
      o.r50 = o.r42 / o.r49;                                // CTTT at D'
      o.r51 = Math.acos(r.C39 / o.r37) * R2D;               // PA at D'
      o.r52 = Math.tan(o.r51 * D2R);
      o.r53 = o.r52 - o.r51 * D2R;                          // inv PA at D'
      return o;
    };
    const I = col(C15), J = col(C16);
    // row 54: NOTE spreadsheet J54 divides by I37 (min-CT D'), not J37. Kept as-is.
    I.r54 = ((I.r50 / I.r37) + I.r53) * r.C39;
    J.r54 = ((J.r50 / I.r37) + J.r53) * r.C39;
    for (const o of [I, J]) {
      o.r55 = r.C38 * ((o.r54 / r.C39) - r.C49);           // CTTT at PD
      o.r57 = o.r54 * r.C50;                                // CTTN at BD
      o.r58 = ((o.r55 / r.C53) - r.C51) / r.C54;            // X
    }
    I.r59 = r.C52 - r.C37 - J.r58;
    J.r59 = r.C52 - r.C37 - I.r58;
    // J44 (both cells) = (C16/2)/(J38-J39) - display only
    r.tanHalf = (C16 / 2) / (J.r38 - J.r39);
    r.I = I; r.J = J;
    r.E49 = 1 + (r.E48 - J.r54) / r.C43;                    // theoretical teeth to span
    r.TB = r.C41 * PI / 2 / C10;                            // J18 TB @ AB
    const span = (n) => ({ n, max: (n - 1) * r.C23 + J.r57, min: (n - 1) * r.C23 + I.r57 });
    r.spanMain = span(inp.spanN);
    r.spans = (inp.spanList || [17, 16, 15]).map(span);
    r.crMax = J.r59; r.crMin = I.r59;
    r.faceWidth = r.spanMain.max * r.C56;                   // I27
    return r;
  }
  root.SpanCR = { calc, EXAMPLE: { N: 142, DPT: 2.5, PAT: 20, HA: 30, OD: 57.12, CA: 0.1608, CTmin: 0.4262, CTmax: 0.4294, spanN: 16, spanList: [17, 16, 15] } };
  if (typeof module !== 'undefined') module.exports = root.SpanCR;
})(typeof window !== 'undefined' ? window : globalThis);
