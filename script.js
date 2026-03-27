const form = document.getElementById('mortgageForm');
const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const loanYearsInput = document.getElementById('loanYears');
const loanYearsRange = document.getElementById('loanYearsRange');
const rateTypeSelect = document.getElementById('rateType');
const monthlyPaymentEl = document.getElementById('monthlyPayment');
const totalInterestEl = document.getElementById('totalInterest');
const totalPaidEl = document.getElementById('totalPaid');
const summaryTextEl = document.getElementById('summaryText');
const heroRateEl = document.getElementById('heroRate');
const errorMessageEl = document.getElementById('errorMessage');
const rateContextEl = document.getElementById('rateContext');
const resetBtn = document.getElementById('resetBtn');
const currentYearEl = document.getElementById('currentYear');

const euroFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
});

function syncYearsFromRange() {
  loanYearsInput.value = loanYearsRange.value;
  calculateMortgage();
}

function syncYearsFromInput() {
  const years = clampNumber(Number(loanYearsInput.value), 5, 40);
  loanYearsInput.value = years;
  loanYearsRange.value = years;
  calculateMortgage();
}

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0);
}

function updateRateContext() {
  if (rateTypeSelect.value === 'fixed') {
    rateContextEl.textContent = 'Hai selezionato un tasso fisso: la formula restituisce una rata costante per tutta la durata del mutuo.';
  } else {
    rateContextEl.textContent = 'Hai selezionato un tasso variabile: la formula fornisce una stima basata sul tasso attuale inserito, che potrebbe cambiare nel tempo.';
  }
}

function validateInputs(amount, annualRate, years) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Inserisci un importo del mutuo maggiore di zero.';
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return 'Inserisci un tasso di interesse valido pari o superiore a zero.';
  }

  if (!Number.isFinite(years) || years < 1) {
    return 'Inserisci una durata valida del mutuo.';
  }

  return '';
}

function calculateMortgage(event) {
  if (event) event.preventDefault();

  const amount = Number(loanAmountInput.value);
  const annualRate = Number(interestRateInput.value);
  const years = Number(loanYearsInput.value);
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  updateRateContext();

  const validationError = validateInputs(amount, annualRate, years);
  if (validationError) {
    errorMessageEl.textContent = validationError;
    monthlyPaymentEl.textContent = '€ 0';
    totalInterestEl.textContent = '€ 0';
    totalPaidEl.textContent = '€ 0';
    heroRateEl.textContent = '€ 0';
    summaryTextEl.textContent = 'Correggi i dati inseriti per ottenere una simulazione del mutuo.';
    return;
  }

  errorMessageEl.textContent = '';

  let monthlyPayment;

  if (monthlyRate === 0) {
    monthlyPayment = amount / months;
  } else {
    monthlyPayment = amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - amount;

  monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
  totalInterestEl.textContent = formatCurrency(totalInterest);
  totalPaidEl.textContent = formatCurrency(totalPaid);
  heroRateEl.textContent = formatCurrency(monthlyPayment);

  const rateLabel = rateTypeSelect.value === 'fixed' ? 'tasso fisso' : 'tasso variabile stimato';

  summaryTextEl.innerHTML = `Per un mutuo di <strong>${formatCurrency(amount)}</strong> con <strong>${annualRate.toFixed(2)}%</strong> di interesse annuo a <strong>${rateLabel}</strong> e durata di <strong>${years} anni</strong>, la rata mensile stimata è di <strong>${formatCurrency(monthlyPayment)}</strong>. Gli interessi complessivi ammontano a <strong>${formatCurrency(totalInterest)}</strong>, per un totale rimborsato di <strong>${formatCurrency(totalPaid)}</strong>.`;
}

function resetCalculator() {
  loanAmountInput.value = 150000;
  interestRateInput.value = 3.5;
  loanYearsInput.value = 25;
  loanYearsRange.value = 25;
  rateTypeSelect.value = 'fixed';
  errorMessageEl.textContent = '';
  updateRateContext();
  calculateMortgage();
}

form.addEventListener('submit', calculateMortgage);
loanYearsRange.addEventListener('input', syncYearsFromRange);
loanYearsInput.addEventListener('input', syncYearsFromInput);
loanAmountInput.addEventListener('input', calculateMortgage);
interestRateInput.addEventListener('input', calculateMortgage);
rateTypeSelect.addEventListener('change', calculateMortgage);
resetBtn.addEventListener('click', resetCalculator);

currentYearEl.textContent = new Date().getFullYear();
updateRateContext();
calculateMortgage();
