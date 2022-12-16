//https://stackoverflow.com/questions/53369407/include-tobecloseto-in-jest-tomatchobject
function toBeAround(actual, expected, precision = 2) {
  const pass = Math.abs(expected - actual) < Math.pow(10, -precision) / 2
  if (pass) {
    return {
      message: () => `expected ${actual} not to be around ${expected}`,
      pass: true
    }
  } else {
    return {
      message: () => `expected ${actual} to be around ${expected}`,
      pass: false
    }
  }
}


function toBeWithinNOf(actual, expected, n) {
  const pass = Math.abs(actual - expected) <= n
  if (pass) {
    return {
      message: () => `expected ${actual} not to be within ${n} of ${expected}`,
      pass: true
    }
  } else {
    return {
      message: () => `expected ${actual} to be within ${n} of ${expected}`,
      pass: false
    }
  }
}

module.exports = {
  toBeWithinNOf,
  toBeAround
}