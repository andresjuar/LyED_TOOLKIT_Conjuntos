const conjuntos = {};

// Agregar conjunto dinámicamente
document.getElementById('agregarBtn').addEventListener('click', () => {
  const container = document.createElement('div');
  container.className = 'conjunto';

  const idInput = document.createElement('input');
  idInput.placeholder = 'ID';
  idInput.maxLength = 1;

  const valuesInput = document.createElement('input');
  valuesInput.placeholder = 'Elementos separados por coma (Ej: 1,2,a,b)';

  container.appendChild(idInput);
  container.appendChild(valuesInput);
  document.getElementById('conjuntosContainer').appendChild(container);
});

// Insertar símbolo en input
document.querySelectorAll('.simbolo').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('operacionInput');
    input.value += btn.textContent;
    input.focus();
  });
});

// Funciones de conjuntos
const union = (a, b) => new Set([...a, ...b]);
const interseccion = (a, b) => new Set([...a].filter(x => b.has(x)));
const diferencia = (a, b) => new Set([...a].filter(x => !b.has(x)));
const diferenciaSimetrica = (a, b) => union(diferencia(a, b), diferencia(b, a));

// Convertir una operación infix como "A∩B" a "interseccion(conjuntos["A"], conjuntos["B"])"
function parseOperacion(expr) {
  const ops = {
    '∪': 'union',
    '∩': 'interseccion',
    '-': 'diferencia',
    'Δ': 'diferenciaSimetrica'
  };

  const output = [];
  const stack = [];

  const precedence = {
    '∪': 1,
    '∩': 2,
    '-': 2,
    'Δ': 2
  };

  const tokens = expr.match(/[A-Za-z]+|[∪∩\-Δ()]|/g);

  for (let token of tokens) {
    if (/[A-Za-z]/.test(token)) {
      output.push(`conjuntos["${token}"]`);
    } else if (token in ops) {
      while (
        stack.length &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop(); // quitar el '('
    }
  }

  while (stack.length) {
    output.push(stack.pop());
  }

  // Evaluar usando una pila
  const evalStack = [];
  for (let token of output) {
    if (token.startsWith('conjuntos')) {
      evalStack.push(token);
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      evalStack.push(`${ops[token]}(${a}, ${b})`);
    }
  }

  return evalStack[0];
}

document.getElementById('calculoBtn').addEventListener('click', () => {
  const conjuntosDiv = document.querySelectorAll('.conjunto');
  const conjuntosVisuales = {};

  // Leer conjuntos y tratar vacíos como conjunto vacío
  conjuntosDiv.forEach(div => {
    const [idInput, valuesInput] = div.querySelectorAll('input');
    const id = idInput.value.trim();
    const values = valuesInput.value.split(',').map(v => v.trim()).filter(v => v !== '');
    conjuntos[id] = new Set(values); // Si está vacío, será new Set()
    conjuntosVisuales[id] = `{${[...conjuntos[id]].join(', ')}}`;
  });

  const rawOperacion = document.getElementById('operacionInput').value.trim();
  const resultadoDiv = document.getElementById('resultado');

  if (!rawOperacion) {
    resultadoDiv.innerText = 'Por favor, ingresa una operación.';
    return;
  }

  try {
    const exprJS = parseOperacion(rawOperacion);
    const resultSet = eval(exprJS);

    if (!(resultSet instanceof Set)) throw new Error("Resultado inválido");

    // Generar representación visual de la operación con valores
    let operacionVisual = rawOperacion.replace(/[A-Za-z]/g, match => {
      return conjuntosVisuales[match] || '{}';
    });

    resultadoDiv.innerText = `${operacionVisual} = {${[...resultSet].join(', ')}}`;
    resultadoDiv.style.display = 'block';

  } catch (error) {
    resultadoDiv.innerText = 'Error en la operación. Asegúrate de que esté bien escrita y que los conjuntos existan.';
    resultadoDiv.style.display = 'block';
    console.error(error);
  }
});
