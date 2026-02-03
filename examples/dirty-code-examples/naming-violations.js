// Dirty Code Example - Naming Convention Violations

// Variable naming violations
const data = "user information";
const info = { name: "John", age: 30 };
const item = [1, 2, 3];
const result = calculateTotal();
const temp = "temporary value";
const tmp = "another temp";
const obj = { prop: "value" };
const arr = ["a", "b", "c"];
const val = 42;
const res = "response data";
const req = "request data";
const cfg = { debug: true };

// Function naming violations
function get() {
  return data;
}

function set(value) {
  data = value;
}

function update() {
  return "updated";
}

function deleteItem() {
  return "deleted";
}

function add() {
  return "added";
}

function user() {
  return "user data";
}

function dataFunc() {
  return "data value";
}

function process() {
  return "processed";
}

// Class naming violations
class getters {
  constructor() {
    this.data = "test";
  }
}

class handlers {
  handle() {
    return "handled";
  }
}

class processors {
  process() {
    return "processed";
  }
}

// Interface naming violations (TypeScript style)
class IUser {
  getName() {
    return "user";
  }
}

class IData {
  getValue() {
    return "data";
  }
}

class IService {
  execute() {
    return "executed";
  }
}

// Hungarian notation violations
const strName = "John Doe";
const intCount = 42;
const boolFlag = true;
const objData = { id: 1 };
const arrItems = [1, 2, 3];
const numValue = 100;
const txtMessage = "Hello";

// Non-pronounceable names
const x = 10;
const y = 20;
const a1 = "first";
const b2 = "second";
const z9 = "last";

// Import/Export violations (if this were a module)
// import data from './module';
// export const temp = 'temporary';

// Mixed violations in a function
function calculateTotal() {
  const temp = 100;
  const data = [1, 2, 3, 4, 5];
  const result = data.reduce((acc, val) => acc + val, 0);
  return result;
}

// Object property violations
const userData = {
  data: "user info",
  info: "more info",
  item: "user item",
  result: "calculation result",
};

// Export violations
const dataExport = "exported data";
const tempExport = "temporary export";
const objExport = { type: "export" };

export { dataExport, tempExport, objExport };
