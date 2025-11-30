// script.js - Lógica del gráfico y cálculo
(function(){
  // Modelo: C(t) = 1.2 + 0.3 * sin(t)  (t en horas)
  function C(t){ return 1.2 + 0.3 * Math.sin(t); }
  // Antiderivada usada: F(t) - F(0) = 1.2*t - 0.3*(cos(t)-1)
  function integralExact(t){ return 1.2*t - 0.3*(Math.cos(t) - 1); }

  // DOM
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const summary = document.getElementById('summary');
  const integralText = document.getElementById('integralText');
  const litersDiv = document.getElementById('liters');
  const canvas = document.getElementById('plot');
  const ctx = canvas.getContext('2d');

  // Configuración de la gráfica (fija según tus instrucciones)
  const X_MIN = 0, X_MAX = 24; // horas
  const Y_MIN = 0.5, Y_MAX = 2.0; // L/h rango fijo

  function toCanvasX(t){ return (t - X_MIN) / (X_MAX - X_MIN) * canvas.width; }
  function toCanvasY(y){ return canvas.height - ( (y - Y_MIN) / (Y_MAX - Y_MIN) * canvas.height ); }

  function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

  function drawGrid(){
    clear();
    // fondo
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid lines
    ctx.strokeStyle = '#e0ecff';
    ctx.lineWidth = 1;
    for(let h=0; h<=24; h+=2){
      const x = toCanvasX(h);
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    for(let y=Y_MIN; y<=Y_MAX; y+=0.25){
      const yy = toCanvasY(y);
      ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(canvas.width,yy); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#345e8a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, toCanvasY(Y_MIN)); ctx.lineTo(canvas.width, toCanvasY(Y_MIN)); ctx.stroke();

    // labels X
    ctx.fillStyle = '#17385a'; ctx.font = '12px Tahoma'; ctx.textAlign = 'center';
    for(let h=0; h<=24; h+=2){
      const x = toCanvasX(h);
      ctx.fillText(h + 'h', x, toCanvasY(Y_MIN) + 16);
    }

    // labels Y
    ctx.textAlign = 'right';
    for(let y=Y_MIN; y<=Y_MAX; y+=0.25){
      const yy = toCanvasY(y);
      ctx.fillText(y.toFixed(2), canvas.width - 6, yy - 4);
    }
  }

  function drawFunctionAndArea(T){
    drawGrid();

    // Sample points for function
    const samples = 800; const dt = (X_MAX - X_MIN)/samples;
    ctx.lineWidth = 2;

    // First draw shaded area from 0 to T
    ctx.beginPath();
    // move to x=0 baseline
    ctx.moveTo(toCanvasX(0), toCanvasY(Y_MIN));
    for(let i=0;i<=samples;i++){
      const t = X_MIN + i*dt;
      if(t > T) break;
      const y = Math.min(Math.max(C(t), Y_MIN), Y_MAX);
      ctx.lineTo(toCanvasX(t), toCanvasY(y));
    }
    // close to baseline at x=T
    ctx.lineTo(toCanvasX(T), toCanvasY(Y_MIN));
    ctx.closePath();
    ctx.fillStyle = 'rgba(61,140,210,0.25)';
    ctx.fill();

    // draw function curve
    ctx.beginPath();
    let started=false;
    for(let i=0;i<=samples;i++){
      const t = X_MIN + i*dt;
      const y = Math.min(Math.max(C(t), Y_MIN), Y_MAX);
      const cx = toCanvasX(t), cy = toCanvasY(y);
      if(!started){ ctx.moveTo(cx,cy); started=true;} else ctx.lineTo(cx,cy);
    }
    ctx.strokeStyle = '#1b4f86'; ctx.stroke();

    // Draw vertical markers at 0 and T
    ctx.strokeStyle = '#2f5f90';
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(toCanvasX(0),0); ctx.lineTo(toCanvasX(0),canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toCanvasX(T),0); ctx.lineTo(toCanvasX(T),canvas.height); ctx.stroke();
    ctx.setLineDash([]);

    // Draw integral text on top-left of area
    const integrText = `∫₀^${T.toFixed(3)} (1.2 + 0.3·sin(t)) dt`;
    ctx.fillStyle = '#06345b'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    ctx.fillText(integrText, 12, 22);
  }

  function validateInputs(h,m){
    const hours = Number(h); const minutes = Number(m);
    if(isNaN(hours) || isNaN(minutes)) return {ok:false,msg:'Horas o minutos inválidos.'};
    if(hours<0 || hours>24) return {ok:false,msg:'Horas debe estar entre 0 y 24.'};
    if(minutes<0 || minutes>=60) return {ok:false,msg:'Minutos debe estar entre 0 y 59.'};
    if(hours===0 && minutes===0) return {ok:false,msg:'Debe ingresar un tiempo mayor a 0.'};
    // total hours <=24
    const total = hours + minutes/60;
    if(total>24) return {ok:false,msg:'El tiempo máximo permitido es 24 horas.'};
    return {ok:true,total};
  }

  // eventos
  calcBtn.addEventListener('click', ()=>{
    const h = parseFloat(hoursInput.value);
    const m = parseFloat(minutesInput.value);
    const v = validateInputs(h,m);
    if(!v.ok){ summary.textContent = v.msg; integralText.textContent=''; litersDiv.textContent=''; drawGrid(); return; }
    const T = v.total; // horas en decimal
    // calcular integral exacta
    const liters = integralExact(T);
    summary.innerHTML = `Tiempo: ${h} h ${m} min → ${T.toFixed(3)} horas (decimal)`;
    integralText.textContent = `∫₀^${T.toFixed(3)} (1.2 + 0.3 sin(t)) dt = `;
    litersDiv.textContent = `${liters.toFixed(2)} litros`;
    drawFunctionAndArea(T);
  });

  resetBtn.addEventListener('click', ()=>{
    hoursInput.value = 0; minutesInput.value = 30;
    summary.textContent = 'Ingrese un tiempo y presione "Calcular consumo".';
    integralText.textContent = ''; litersDiv.textContent=''; drawGrid();
  });

  // inicializar
  drawGrid();
})();
