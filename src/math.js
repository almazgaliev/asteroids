

/**
 * создает ILERP функцию
 * @param {number} a from
 * @param {number} b to
 * @returns {(x: number) => number} функция ILERP
 */
export function getILERP(a, b) {
  return x => (x - a) / (b - a);
}

/**
 * создает LERP функцию
 * @param {number} a from
 * @param {number} b to
 * @returns {(x: number) => number} функция LERP
 */
export function getLERP(a, b) {
  return t => (1 - t) * a + t * b;
}

/**
 * создает remap функцию
 * @param {number} a from a
 * @param {number} b from b
 * @param {number} c to a
 * @param {number} d to b
 * @returns {(x: number) => number} функция remap
 */
export function getRemap(a, b, c, d) {
  function remap(x) {
    let t = (x - a) / (b - a);
    return (1 - t) * c + t * d;
  }
  return remap;
}

/**
 * переводит градусы в радианы
 * @param {number} angleDeg угол в градусах
 * @returns угол в радианах
 */
export function degToRad(angleDeg) {
  return angleDeg / 180 * Math.PI;
}

/**
 * матрица сдвига
 * @param {number[]} vector вектор сдвига
 * @returns матрица сдвига
 */
export function moveMatrix(vector) {
  return [
    [1, 0, vector[0]],
    [0, 1, vector[1]],
    [0, 0, 1],
  ];
}

/**
 * матрица масштаба
 * @param {number[]} vector вектор масштаба
 * @returns матрица сдвига
 */
export function scaleMatrix(vector) {
  return [
    [vector[0], 0, 0],
    [0, vector[1], 0],
    [0, 0, 1],
  ];
}


/**
 * матрица поворота
 * @param {number} angle угол поворота **В РАДИАНАХ**
 * @returns матрица поворота
 */
export function rotateMatrix(angle) {
  return [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1],
  ];
}

/**
 * единичная матрица
 * @param {number} n размерность матрицы
 * @returns {number[][]} единичная матрица размерности `n x n`
 */
export function identityMatrix(n) {
  let res = [];
  for (let i = 0; i < n; i++) {
    res.push([]);
    for (let j = 0; j < n; j++) {
      {
        res[i][j] = (i == j) ? 1 : 0;
      }
    }
  }
  return res;
}

/**
 * вычисляет модуль вектора
 * @param {number[]} vector
 * @returns {number} модуль вектора
 */
export function magnitude(vector) {
  let sumSquare = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSquare += vector[i] ** 2;
  }
  return Math.sqrt(sumSquare);
}

/**
 * нормализирует вектор (**на месте**)
 * @param {number[]} vector
 */
export function normalizeMut(vector) {
  let mag = magnitude(vector);
  for (let i = 0; i < vector.length; i++) {
    vector[i] /= mag;
  }
}


/**
 * нормализирует вектор
 * @param {number[]} vector
 * @returns {number[]} нормаль вектора
 */
export function normalize(vector) {
  let mag = magnitude(vector);
  let resVec = [];
  for (let i = 0; i < vector.length; i++) {
    resVec.push(vector[i] / mag);
  }
  return resVec;
}

/**
 * умножение вектора на скаляр (**на месте**)
 * @param {number[]} vector результат умножения
 * @param {number} scalar 
 */
export function multiplyVSMut(vector, scalar) {
  for (let i = 0; i < vector.length; i++) {
    vector[i] *= scalar;
  }
}

/**
 * скалярное произведение векторов
 * @param {number[]} vector1
 * @param {number[]} vector2
 * @returns {number} скалярное произведение векторов
 */
export function multiplyVV(vector1, vector2) {
  let res = 0;
  for (let i = 0; i < vector1.length; i++) {
    res += vector1[i] * vector2[i];
  }
  return res;
}

/**
 * умножение вектора на скаляр
 * @param {number[]} vector 
 * @param {number} scalar 
 * @returns {number[]} произведение вектора на скаляр
 */
export function multiplyVS(vector, scalar) {
  let resVec = [];
  for (let i = 0; i < vector.length; i++) {
    resVec.push(vector[i] * scalar);
  }
  return resVec;
}

/**
 * вычисляет умножение матрицы на вектор
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
export function multiplyMV(matrix, vector) {
  let resVec = [];
  for (let i = 0; i < matrix.length; i++) {
    let res = 0;
    for (let j = 0; j < matrix[i].length; j++) {
      res += matrix[i][j] * vector[j];
    }
    resVec.push(res);
  }
  return resVec;
}
/**
 * вычисляет сумму векторов (**на месте**)
 * @param {number[]} vector1 результат сложения
 * @param {number[]} vector2
 */
export function addMut(vector1, vector2) {
  for (let i = 0; i < vector1.length; i++) {
    vector1[i] += vector2[i];
  }
}

/**
 * вычисляет сумму векторов
 * @param {number[]} vector1 
 * @param {number[]} vector2 
 * @returns {number[]} сумма векторов
 */
export function add(vector1, vector2) {
  let resVec = [];
  for (let i = 0; i < vector1.length; i++) {
    resVec.push(vector1[i] + vector2[i]);
  }
  return resVec;
}
/**
 * тривиальное умножение матриц (**на месте**)
 * @param {number[][]} matrix1
 * @param {number[][]} matrix2
 * @param {number[][]} res результат умножения
 */
export function multiplyMMMut(matrix1, matrix2, res) {
  let N = Math.min(matrix1.length, matrix2[0].length);
  for (let i = 0; i < matrix1.length; i++) {
    for (let j = 0; j < matrix2[0].length; j++) {
      res[i][j] = 0;
      for (let k = 0; k < N; k++)
        res[i][j] += matrix1[i][k] * matrix2[k][j];
    }
  }
}

/**
 * тривиальное умножение матриц
 * @param {number[][]} matrix1 
 * @param {number[][]} matrix2 
 * @returns {number[][]}
 */
export function multiplyMM(matrix1, matrix2) {
  let res = [];
  let N = Math.min(matrix1.length, matrix2[0].length);
  for (let i = 0; i < matrix1.length; i++) {
    res.push([]);
    for (let j = 0; j < matrix2[0].length; j++) {
      res[i][j] = 0;
      for (let k = 0; k < N; k++)
        res[i][j] += matrix1[i][k] * matrix2[k][j];
    }
  }
  return res;
}

