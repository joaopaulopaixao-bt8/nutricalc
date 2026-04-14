function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function validatePositiveMeasurement(value, label) {
  if (value === null || value <= 0) {
    throw new Error(`${label} precisa ser maior que zero.`);
  }
}

function calculateNavyBodyFat({ sex, height, neck, waist, hip }) {
  const normalizedSex = String(sex || "").trim().toUpperCase();
  const parsedHeight = toNumber(height);
  const parsedNeck = toNumber(neck);
  const parsedWaist = toNumber(waist);
  const parsedHip = hip === undefined || hip === null || hip === "" ? null : toNumber(hip);

  if (!["M", "F"].includes(normalizedSex)) {
    throw new Error("Sexo inválido. Use M ou F.");
  }

  validatePositiveMeasurement(parsedHeight, "Altura");
  validatePositiveMeasurement(parsedNeck, "Pescoço");
  validatePositiveMeasurement(parsedWaist, "Cintura");

  if (normalizedSex === "F") {
    validatePositiveMeasurement(parsedHip, "Quadril");
  }

  let bodyFat;
  if (normalizedSex === "M") {
    const diff = parsedWaist - parsedNeck;
    if (diff <= 0) {
      throw new Error("A cintura precisa ser maior que o pescoço para o cálculo masculino.");
    }
    bodyFat =
      86.010 * Math.log10(diff) -
      70.041 * Math.log10(parsedHeight) +
      36.76;
  } else {
    const diff = parsedWaist + parsedHip - parsedNeck;
    if (diff <= 0) {
      throw new Error("A soma cintura + quadril precisa ser maior que o pescoço para o cálculo feminino.");
    }
    bodyFat =
      163.205 * Math.log10(diff) -
      97.684 * Math.log10(parsedHeight) -
      78.387;
  }

  const rounded = Number(bodyFat.toFixed(1));
  return {
    bodyFatPercentage: rounded,
    method: "navy_formula",
    note: "Estimativa baseada na fórmula da Marinha dos EUA. Pode variar em relação à avaliação presencial.",
  };
}

module.exports = {
  calculateNavyBodyFat,
};
