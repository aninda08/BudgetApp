//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    }
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            
            if(data.allItems[type].length == 0)
                ID = 0;
            else
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            
            if(type === 'inc')
                newItem = new Income(ID, desc, val);
            else if(type == 'exp')
                newItem = new Expense(ID, desc, val);

            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);
            
            if(index !== -1)
                data.allItems[type].splice(index,1);
        },

        calculateBudget: function() {
            var totalExpenses, totalIncome, budget, spent;
            //Calculate total expenses and income
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp * 100) / data.totals.inc);
            else
                data.percentage = -1;

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalExp: data.totals.exp,
                totalInc: data.totals.inc
            };
        },
        testing: function() {
            console.log(data);
        }
    }
})();

//UI CONTROLLER
var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml,element;
            //Create HTML Strings with placeholder text
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">  <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            
            //Replace placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value));

            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            
            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, (obj.budget > 0 ? 'inc' : 'exp'));
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

            if(obj.percentage > 0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            else
            document.querySelector(DOMStrings.percentageLabel).textContent = "---";
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                current.textContent = '---';
            });
        },
        displayDate: function() {
            var now, month, year;

            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now =new Date();
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ',' + year;
        },
        changedType: function() {
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },
        getDOMstrings: function() {
            return DOMStrings;
        }
    };
})();

//APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", crtlAddItem);

        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 || event.which === 13)
                crtlAddItem();
        });

        document.querySelector(DOM.container).addEventListener("click", crtldeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    
    var crtlAddItem = function () {
        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //1. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //2. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //3. Clear the fields
            UICtrl.clearFields();
            //4.Calculate and update budget
            updateBudget();
            //5.Calculate and update the percentages
            updatePercentages();
        }
        
        
    };

    var crtldeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the datastructure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            //4.Calculate and update the percentages
            updatePercentages();
        }   
    };

    var updateBudget = function() {
        var budget;
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget Controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update the UI with the new perecentages
        UICtrl.displayPercentages(percentages);
    };

    return {
        init: function() {
            console.log('Application just started.');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                percentage: 0,
                totalExp: 0,
                totalInc: 0
            });
            setupEventListners();
        }
    }
    
})(budgetController, UIController);

controller.init();