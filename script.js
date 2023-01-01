"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP


const form = document.querySelector('.login');

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);


function getAccountObject(data) {
  console.log(data);
  let acc = JSON.parse(data);
  if (!acc['movements']) {
    return null;
  }
  acc['movements'] = JSON.parse(acc['movements']);
  return acc;
}

// DISPLAY DEPOSITS AND WITHDRAWLS

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>

        <div class="movements__value">${mov}</div>
      </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${acc.balance}`;
};
//Calculate total deposte , withdrawls and intrest in the --FOOTER--
const calcDisplaySummery = function (acc) {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.innerText = `${income}`;

  const callOut = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.innerText = `${Math.abs(callOut)}`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, mov) => acc + mov, 0);

  labelSumInterest.innerText = interest;
};

// CREATE A USERNAME
const createUsername = function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  
};
// createUsernames(accounts);

// createUsernames(accounts);

const updateUI = function (acc) {
  displayMovements(acc.movements);

  //Display Balance
  calcDisplayBalance(acc);
  // console.log(acc.balance);

  //Display summery
  calcDisplaySummery(acc);
};

let currentAccount;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const body = {username:inputLoginUsername.value,pin:inputLoginPin.value}


  $.ajax({
    type: 'post',
    url: 'backend/getuser.php',
    data: body
  }).done(function (res) {
    // console.log("data");
    currentAccount = getAccountObject(res);

    if (currentAccount['owner'] && currentAccount['pin']==inputLoginPin.value) {
      // Display UI and message
      labelWelcome.textContent = `Welcome back, ${
        currentAccount.owner.split(" ")[0]
      }`;
      containerApp.style.opacity = 100;
  
      // Clear input fields
      inputLoginUsername.value = inputLoginPin.value = "";
      inputLoginPin.blur();
  
      //Display Movements
      updateUI(currentAccount);
    }
    
  });

});

//Transfer Amount to other Account
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  $.ajax({
    type: 'post',
    url: 'backend/getuser.php',
    data: {username: inputTransferTo.value}
  }).done((res) => {
    const receiverAcc = getAccountObject(res);
    if (
      amount &&
      receiverAcc['owner'] &&
      currentAccount.balance >= amount &&
      receiverAcc.username !== currentAccount.username
    ) {
      // console.log(currentAccount);
      // console.log(receiverAcc);
  
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      $.ajax({
        type: 'post',
        url: 'backend/updateMovements.php',
        data: { acc: currentAccount, val: -amount }
      })
        .done(() => {
          $.ajax({
            type: 'post',
            url: 'backend/updateMovements.php',
            data: { acc: receiverAcc, val: amount }
          })
            .done(() => {
            
            updateUI(currentAccount);
          })
          
        }
      )

    }
 })
});

//To Add LOAN
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {

    currentAccount.movements.push(amount);
    $.ajax({
      type: 'post',
      url: 'backend/updateMovements.php',
      data: { acc: currentAccount, val: amount }
    }).done(() => {
      
    updateUI(currentAccount);
    })
    //Update UI
  }

  inputLoanAmount.value = "";
});

// To Close Account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  console.log(currentAccount.pin)
  console.log(currentAccount.username)
  console.log(inputClosePin.value)
  console.log(inputCloseUsername.value)
  if (
    inputCloseUsername.value === currentAccount.username &&
    inputClosePin.value === currentAccount.pin
  ) {
    $.ajax({
      type: 'post',
      url: 'backend/deleteuser.php',
      data: {username: currentAccount.username}
    }).done((res) => {
      let data = JSON.parse(res);
      // console.log(data);
      if (data.status == 200) { 
        containerApp.style.opacity = 0;
      }
    })
  }
  inputCloseUsername.value = inputClosePin.value = "";
});
let sorted = false;

//To sort Transictions OR movements
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});



   
