/* ======== State ======== */
const state = {
  expr: "",
  history: [],
  trigMode: "DEG"
};

/* ======== Helpers ======== */
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

/* Trig mode handling */
function applyTrigMode(fn, x) {
  if (state.trigMode === "DEG") return fn(x * Math.PI / 180);
  if (state.trigMode === "GRAD") return fn(x * Math.PI / 200);
  return fn(x);
}

/* Evaluate expression */
function evaluateExpression(expr) {
  try {
    return math.evaluate(expr, {
      sin: x => applyTrigMode(Math.sin, x),
      cos: x => applyTrigMode(Math.cos, x),
      tan: x => applyTrigMode(Math.tan, x),
      asin: x => (state.trigMode === "DEG" ? Math.asin(x)*180/Math.PI :
                  state.trigMode === "GRAD" ? Math.asin(x)*200/Math.PI : Math.asin(x)),
      acos: x => (state.trigMode === "DEG" ? Math.acos(x)*180/Math.PI :
                  state.trigMode === "GRAD" ? Math.acos(x)*200/Math.PI : Math.acos(x)),
      atan: x => (state.trigMode === "DEG" ? Math.atan(x)*180/Math.PI :
                  state.trigMode === "GRAD" ? Math.atan(x)*200/Math.PI : Math.atan(x)),
    });
  } catch {
    return "Error";
  }
}

/* ======== Calculator Pad ======== */
function buildPad(mode) {
  const pad = $('#pad');
  pad.innerHTML = "";

  let layout = [];
  if (mode === "basic") {
    layout = [
      ["7","8","9","/"],
      ["4","5","6","*"],
      ["1","2","3","-"],
      ["0",".","=","+"],
      ["C","DEL","(",")"]
    ];
    pad.style.gridTemplateColumns = "repeat(4,1fr)";
  } else if (mode === "scientific") {
    layout = [
      ["sin","cos","tan","log","ln","^"],
      ["π","e","√","(",")","C"],
      ["7","8","9","/","%","DEL"],
      ["4","5","6","*","",""],
      ["1","2","3","-","",""],
      ["0",".","=","+","",""]
    ];
    pad.style.gridTemplateColumns = "repeat(6,1fr)";
  }

  layout.forEach(row => {
    row.forEach(k => {
      if (!k) {
        const empty = document.createElement("div");
        pad.appendChild(empty);
        return;
      }
      const btn = document.createElement("button");
      btn.className = "btn-key";
      if (["/","*","-","+","=","C","DEL","^","√","π","e","log","ln","sin","cos","tan","%"].includes(k)) {
        btn.classList.add("op");
      }
      btn.textContent = k;
      btn.addEventListener("click", () => handleKey(k));
      pad.appendChild(btn);
    });
  });
}

/* ======== Handle Key ======== */
function handleKey(k) {
  const display = $('#display');
  if (k === "C") {
    state.expr = "";
  } else if (k === "DEL") {
    state.expr = state.expr.slice(0, -1);
  } else if (k === "=") {
    const result = evaluateExpression(state.expr);
    state.history.push({ expr: state.expr, result });
    state.expr = String(result);
  } else if (k === "π") {
    state.expr += Math.PI;
  } else if (k === "e") {
    state.expr += Math.E;
  } else if (k === "√") {
    state.expr += "sqrt(";
  } else {
    state.expr += k;
  }
  display.value = state.expr || "0";

  // ✨ Animation trigger
  display.classList.add("updated");
  setTimeout(() => display.classList.remove("updated"), 200);
}

/* ======== Tools Renderer ======== */
function renderTools(mode) {
  const area = $('#toolArea');
  area.innerHTML = "";

  // --- Unit Converter ---
  if (mode === "unit") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Unit Converter</h3>
        <div class="form-row"><label>Value</label><input type="number" id="unitVal"></div>
        <div class="form-row"><label>From</label>
          <select id="unitFrom"><option>m</option><option>cm</option><option>km</option></select>
        </div>
        <div class="form-row"><label>To</label>
          <select id="unitTo"><option>m</option><option>cm</option><option>km</option></select>
        </div>
        <button class="btn full" id="unitConvert">Convert</button>
        <div class="result-box" id="unitResult"></div>
      </div>
    `;
    $('#unitConvert').addEventListener('click', () => {
      const v = parseFloat($('#unitVal').value) || 0;
      const from = $('#unitFrom').value, to = $('#unitTo').value;
      let res = v;
      if (from === "m" && to === "cm") res = v*100;
      if (from === "cm" && to === "m") res = v/100;
      if (from === "km" && to === "m") res = v*1000;
      if (from === "m" && to === "km") res = v/1000;
      $('#unitResult').textContent = `${res} ${to}`;
    });
  }

  // --- Financial Calculator ---
  else if (mode === "financial") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Loan Calculator</h3>
        <div class="form-row"><label>Principal</label><input type="number" id="loanP"></div>
        <div class="form-row"><label>Rate (%)</label><input type="number" id="loanR"></div>
        <div class="form-row"><label>Years</label><input type="number" id="loanN"></div>
        <button class="btn full" id="loanCalc">Calculate</button>
        <div class="result-box" id="loanResult"></div>
      </div>
    `;
    $('#loanCalc').addEventListener('click', () => {
      const P = parseFloat($('#loanP').value)||0;
      const r = (parseFloat($('#loanR').value)||0)/100/12;
      const n = (parseFloat($('#loanN').value)||0)*12;
      const EMI = (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) || 0;
      $('#loanResult').textContent = `Monthly EMI = ${EMI.toFixed(2)}`;
    });
  }

  // --- Programmer Calculator ---
  else if (mode === "programmer") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Base Converter</h3>
        <div class="form-row"><label>Decimal</label><input type="number" id="decIn"></div>
        <button class="btn full" id="baseConv">Convert</button>
        <div class="result-box" id="baseResult"></div>
      </div>
    `;
    $('#baseConv').addEventListener('click', () => {
      const d = parseInt($('#decIn').value)||0;
      $('#baseResult').innerHTML = `Bin: ${d.toString(2)}<br>Oct: ${d.toString(8)}<br>Hex: ${d.toString(16).toUpperCase()}`;
    });
  }

  // --- Date Calculator ---
  else if (mode === "date") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Date Difference</h3>
        <div class="form-row"><label>From</label><input type="date" id="date1"></div>
        <div class="form-row"><label>To</label><input type="date" id="date2"></div>
        <button class="btn full" id="dateDiff">Calculate</button>
        <div class="result-box" id="dateResult"></div>
      </div>
    `;
    $('#dateDiff').addEventListener('click', () => {
      const d1 = new Date($('#date1').value);
      const d2 = new Date($('#date2').value);
      if (!d1 || !d2) return;
      const diff = Math.abs(d2-d1)/(1000*60*60*24);
      $('#dateResult').textContent = `${diff} days`;
    });
  }

  // --- Matrix Calculator ---
  else if (mode === "matrix") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Matrix Calculator</h3>
        <div class="form-row"><label>Matrix A</label><textarea id="matA" class="matrix-input" placeholder="1,2;3,4"></textarea></div>
        <div class="form-row"><label>Matrix B</label><textarea id="matB" class="matrix-input" placeholder="5,6;7,8"></textarea></div>
        <button class="btn full" id="matAdd">A + B</button>
        <button class="btn full" id="matMul">A × B</button>
        <div class="result-box" id="matResult"></div>
      </div>
    `;
    function parseMatrix(id) {
      return math.matrix($('#'+id).value.split(";").map(r=>r.split(",").map(Number)));
    }
    $('#matAdd').addEventListener('click', ()=>{
      try { $('#matResult').textContent = math.add(parseMatrix("matA"), parseMatrix("matB")).toString(); }
      catch { $('#matResult').textContent="Error"; }
    });
    $('#matMul').addEventListener('click', ()=>{
      try { $('#matResult').textContent = math.multiply(parseMatrix("matA"), parseMatrix("matB")).toString(); }
      catch { $('#matResult').textContent="Error"; }
    });
  }

  // --- Statistics Calculator ---
  else if (mode === "stats") {
    area.innerHTML = `
      <div class="tool-card">
        <h3>Statistics</h3>
        <div class="form-row"><label>Numbers (comma separated)</label><input type="text" id="statsNums"></div>
        <button class="btn full" id="statsCalc">Calculate</button>
        <div class="result-box" id="statsResult"></div>
      </div>
    `;
    $('#statsCalc').addEventListener('click', () => {
      const arr = $('#statsNums').value.split(",").map(Number).filter(x=>!isNaN(x));
      if (!arr.length) return;
      const mean = math.mean(arr), median = math.median(arr), std = math.std(arr);
      $('#statsResult').innerHTML = `Mean: ${mean}<br>Median: ${median}<br>StdDev: ${std.toFixed(2)}`;
    });
  }

  // --- History ---
  else if (mode === "history") {
    const hist = state.history.slice().reverse().map(h =>
      `<div>${h.expr} = ${h.result}</div>`
    ).join("");
    area.innerHTML = `<div class="tool-card"><h3>History</h3>${hist || "No history"}</div>`;
  }

  // --- Basic/Scientific placeholder ---
  else if (mode === "basic" || mode === "scientific") {
    area.innerHTML = `<div class="tool-card"><h3>${mode === "basic" ? "Basic Calculator" : "Scientific Calculator"}</h3><div class="muted">Use the pad on the left</div></div>`;
  }
}

/* ======== PDF + History ======== */
async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("CalcHub History", 10, 10);
  state.history.forEach((h, i) => {
    pdf.text(`${h.expr} = ${h.result}`, 10, 20 + i*10);
  });
  pdf.save("history.pdf");
}

function clearHistory() {
  state.history = [];
  renderTools("history");
}

/* ======== Init ======== */
function init() {
  buildPad("basic");
  renderTools("basic");

  $$('.nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;

      if (mode === "basic" || mode === "scientific") {
        $('#calcArea').style.display = "block";
        buildPad(mode);
        renderTools(mode);
      } else {
        $('#calcArea').style.display = "none";
        renderTools(mode);
      }
    });
  });

  $('#trigMode').addEventListener('change', e => {
    state.trigMode = e.target.value;
    $('#subdisplay').textContent = `Trig mode: ${state.trigMode}`;
  });

  $('#downloadPdf').addEventListener('click', downloadPdf);
  $('#clearHistory').addEventListener('click', clearHistory);
}

window.addEventListener('DOMContentLoaded', init);
