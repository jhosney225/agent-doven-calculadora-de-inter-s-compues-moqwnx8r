
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Initialize readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Tool definitions for compound interest calculator
const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calculates compound interest for an investment. Takes principal amount, annual interest rate, compounding frequency, and time period.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount in dollars",
        },
        annual_rate: {
          type: "number",
          description: "The annual interest rate as a percentage (e.g., 5 for 5%)",
        },
        compounds_per_year: {
          type: "number",
          description:
            "Number of times interest is compounded per year (1=annually, 2=semi-annually, 4=quarterly, 12=monthly, 365=daily)",
        },
        years: {
          type: "number",
          description: "The investment period in years",
        },
      },
      required: ["principal", "annual_rate", "compounds_per_year", "years"],
    },
  },
  {
    name: "compare_investments",
    description:
      "Compares two different investment scenarios with compound interest calculations",
    input_schema: {
      type: "object",
      properties: {
        investment1: {
          type: "object",
          properties: {
            principal: { type: "number" },
            annual_rate: { type: "number" },
            compounds_per_year: { type: "number" },
            years: { type: "number" },
            name: { type: "string" },
          },
          required: ["principal", "annual_rate", "compounds_per_year", "years"],
        },
        investment2: {
          type: "object",
          properties: {
            principal: { type: "number" },
            annual_rate: { type: "number" },
            compounds_per_year: { type: "number" },
            years: { type: "number" },
            name: { type: "string" },
          },
          required: ["principal", "annual_rate", "compounds_per_year", "years"],
        },
      },
      required: ["investment1", "investment2"],
    },
  },
  {
    name: "calculate_required_rate",
    description:
      "Calculates the required annual interest rate needed to reach a target amount from an initial investment",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount",
        },
        target_amount: {
          type: "number",
          description: "The target amount you want to reach",
        },
        compounds_per_year: {
          type: "number",
          description: "Number of times interest is compounded per year",
        },
        years: {
          type: "number",
          description: "The investment period in years",
        },
      },
      required: ["principal", "target_amount", "compounds_per_year", "years"],
    },
  },
];

// Implementation of compound interest tools
function calculateCompoundInterest(principal, annualRate, compoundsPerYear, years) {
  const rate = annualRate / 100;
  const amount =
    principal *
    Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
  const interest = amount - principal;

  return {
    principal: parseFloat(principal.toFixed(2)),
    finalAmount: parseFloat(amount.toFixed(2)),
    interestEarned: parseFloat(interest.toFixed(2)),
    annualRate: parseFloat(annualRate.toFixed(2)),
    compoundsPerYear: compoundsPerYear,
    years: years,
    totalReturn: parseFloat(((interest / principal) * 100).toFixed(2)),
  };
}

function compareInvestments(investment1, investment2) {
  const result1 = calculateCompoundInterest(
    investment1.principal,
    investment1.annual_rate,
    investment1.compounds_per_year,
    investment1.years
  );

  const result2 = calculateCompoundInterest(
    investment2.principal,
    investment2.annual_rate,
    investment2.compounds_per_year,
    investment2.years
  );

  const difference = result1.finalAmount - result2.finalAmount;
  const betterInvestment = difference > 0 ? "Investment 1" : "Investment 2";

  return {
    investment1: {
      name: investment1.name || "Investment 1",
      ...result1,
    },
    investment2: {
      name: investment2.name || "Investment 2",
      ...result2,
    },
    comparison: {
      difference: parseFloat(Math.abs(difference).toFixed(2)),
      betterInvestment: betterInvestment,
      betterBy: parseFloat(
        ((Math.abs(difference) / Math.min(result1.finalAmount, result2.finalAmount)) * 100).toFixed(2)
      ),
    },
  };
}

function calculateRequiredRate(principal, targetAmount, compoundsPerYear, years) {
  // Using the formula: r = (n * ((A/P)^(1/(n*t)) - 1))
  const ratio = targetAmount / principal;
  const exponent = 1 / (compoundsPerYear * years);
  const rate = compoundsPerYear * (Math.pow(ratio, exponent) - 1);
  const annualRate = rate * 100