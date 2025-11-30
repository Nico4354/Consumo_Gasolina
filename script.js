// script.js - Lógica ajustada para estética Win95
(function(){
  // Modelo: C(t) = 1.2 + 0.3 * sin(t)
  function C(t){ return 1.2 + 0.3 * Math.sin(t); }
  function integralExact(t){ return 1.2*t - 0.3*(Math.cos(t) - 1); }

  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const summary = document.getElementById('summary');
  const integralText = document.getElementById('integralText');
  const litersDiv = document.getElementById('liters');
  const canvas = document.getElementById('plot');
  const ctx = canvas.getContext('2d');

  const X_MIN = 0, X_MAX = 24; 
  const Y_MIN = 0.5, Y_MAX = 2.0; 

  function toCanvasX(t){ return (t - X_MIN) / (X_MAX - X_MIN) * canvas.width; }
  function toCanvasY(y){ return canvas.height - ( (y - Y_MIN) / (Y_MAX - Y_MIN) * canvas.height ); }

  function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

  function drawGrid(){
    clear();
    // Fondo blanco puro (común en software científico de los 90)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Grid lines: Gris punteado
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]); // Punteado clásico
    
    // Verticales
    for(let h=0; h<=24; h+=2){
      const x = toCanvasX(h);
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    // Horizontales
    for(let y=Y_MIN; y<=Y_MAX; y+=0.25){
      const yy = toCanvasY(y);
      ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(canvas.width,yy); ctx.stroke();
    }
    ctx.setLineDash([]); // Reset dash

    // Ejes principales en Negro
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
    // Eje X (suelo)
    ctx.beginPath(); ctx.moveTo(0, toCanvasY(Y_MIN)); ctx.lineTo(canvas.width, toCanvasY(Y_MIN)); ctx.stroke();
    // Eje Y (izq)
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, canvas.height); ctx.stroke();

    // Textos
    ctx.fillStyle = '#000000'; 
    ctx.font = '10px "MS Sans Serif", Arial, sans-serif'; 
    ctx.textAlign = 'center';
    
    // Etiquetas X
    for(let h=0; h<=24; h+=2){
      const x = toCanvasX(h);
      ctx.fillText(h, x, toCanvasY(Y_MIN) - 4); // Números justo encima de la línea inferior
    }

    // Etiquetas Y
    ctx.textAlign = 'right';
    for(let y=Y_MIN; y<=Y_MAX; y+=0.25){
      const yy = toCanvasY(y);
      ctx.fillText(y.toFixed(2), canvas.width - 4, yy + 3);
    }
  }

  function drawFunctionAndArea(T){
    drawGrid();

    const samples = 400; // Menos samples para que se vea más "computarizado" si quieres, o déjalo alto
    const dt = (X_MAX - X_MIN)/samples;

    // Área sombreada: Cian plano (clásico VGA)
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(Y_MIN));
    for(let i=0;i<=samples;i++){
      const t = X_MIN + i*dt;
      if(t > T) break;
      const y = Math.min(Math.max(C(t), Y_MIN), Y_MAX);
      ctx.lineTo(toCanvasX(t), toCanvasY(y));
    }
    ctx.lineTo(toCanvasX(T), toCanvasY(Y_MIN));
    ctx.closePath();
    ctx.fillStyle = '#00FFFF'; // Cian chillón estilo CGA/VGA
    ctx.fill();
    // Borde del área
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Curva de la función: Azul oscuro solido
    ctx.beginPath();
    let started=false;
    for(let i=0;i<=samples;i++){
      const t = X_MIN + i*dt;
      const y = Math.min(Math.max(C(t), Y_MIN), Y_MAX);
      const cx = toCanvasX(t), cy = toCanvasY(y);
      if(!started){ ctx.moveTo(cx,cy); started=true;} else ctx.lineTo(cx,cy);
    }
    ctx.strokeStyle = '#000080'; // Azul marino
    ctx.lineWidth = 2;
    ctx.stroke();

    // Marcador de tiempo T (Línea roja)
    ctx.strokeStyle = '#FF0000';
    ctx.setLineDash([4,2]);
    ctx.beginPath(); ctx.moveTo(toCanvasX(T),0); ctx.lineTo(toCanvasX(T),canvas.height); ctx.stroke();
    ctx.setLineDash([]);
  }

  function validateInputs(h,m){
    const hours = Number(h); const minutes = Number(m);
    if(isNaN(hours) || isNaN(minutes)) return {ok:false,msg:'Error: Entrada no numérica.'};
    if(hours<0 || hours>24) return {ok:false,msg:'Error: Rango de horas inválido.'};
    if(minutes<0 || minutes>=60) return {ok:false,msg:'Error: Rango de minutos inválido.'};
    const total = hours + minutes/60;
    if(total>24) return {ok:false,msg:'Error: Tiempo excede 24h.'};
    if(total<=0) return {ok:false,msg:'Error: Tiempo debe ser > 0.'};
    return {ok:true,total};
  }

  calcBtn.addEventListener('click', ()=>{
    const h = parseFloat(hoursInput.value);
    const m = parseFloat(minutesInput.value);
    const v = validateInputs(h,m);
    if(!v.ok){ 
        // Usar alert es muy noventero, pero mejor lo ponemos en el div para no bloquear
        summary.textContent = v.msg; 
        summary.style.color = 'red';
        integralText.textContent=''; 
        litersDiv.textContent=''; 
        drawGrid(); 
        return; 
    }
    const T = v.total;
    const liters = integralExact(T);
    
    summary.style.color = 'black';
    summary.innerHTML = `Tiempo Total: ${T.toFixed(3)} h`;
    integralText.textContent = `Integral: ${liters.toFixed(4)}`; // Más decimales = más científico
    litersDiv.textContent = `Consumo: ${liters.toFixed(2)} Litros`;
    drawFunctionAndArea(T);
  });

  resetBtn.addEventListener('click', ()=>{
    hoursInput.value = 0; minutesInput.value = 30;
    summary.textContent = 'Esperando datos...';
    summary.style.color = 'black';
    integralText.textContent = ''; litersDiv.textContent=''; drawGrid();
  });

  // Init
  drawGrid();
})();