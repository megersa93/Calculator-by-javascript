class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement
        this.currentOperandElement = currentOperandElement
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || []
        this.clear()
        this.updateHistoryDisplay()
    }

    clear() {
        this.currentOperand = '0'
        this.previousOperand = ''
        this.operation = undefined
        this.shouldResetScreen = false
    }

    delete() {
        if (this.currentOperand === '0') return
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0'
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1)
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '0'
            this.shouldResetScreen = false
        }

        if (number === '.' && this.currentOperand.includes('.')) return
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString()
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return
        if (this.previousOperand !== '') {
            this.compute()
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
    }

    compute() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current)) return

        const calculation = `${this.previousOperand} ${this.operation} ${this.currentOperand}`

        switch (this.operation) {
            case '+':
                computation = prev + current
                break
            case '-':
                computation = prev - current
                break
            case '×':
                computation = prev * current
                break
            case '÷':
                if (current === 0) {
                    alert('Cannot divide by zero!')
                    return
                }
                computation = prev / current
                break
            case '%':
                computation = prev % current
                break
            default:
                return
        }

        // Add to history
        this.addToHistory(calculation, computation)

        this.currentOperand = computation
        this.operation = undefined
        this.previousOperand = ''
        this.shouldResetScreen = true
    }

    addToHistory(calculation, result) {
        const historyItem = {
            calculation: calculation,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString()
        }

        this.history.unshift(historyItem)

        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50)
        }

        localStorage.setItem('calculatorHistory', JSON.stringify(this.history))
        this.updateHistoryDisplay()
    }

    clearHistory() {
        this.history = []
        localStorage.removeItem('calculatorHistory')
        this.updateHistoryDisplay()
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList')

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>'
            return
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="calculator.useHistoryResult('${item.result}')">
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('')
    }

    useHistoryResult(result) {
        this.currentOperand = result.replace(/,/g, '')
        this.shouldResetScreen = true
        this.updateDisplay()
    }

    formatNumber(number) {
        const stringNumber = number.toString()
        const integerDigits = parseFloat(stringNumber.split('.')[0])
        const decimalDigits = stringNumber.split('.')[1]
        let integerDisplay

        if (isNaN(integerDigits)) {
            integerDisplay = ''
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            })
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`
        } else {
            return integerDisplay
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.formatNumber(this.currentOperand)
        if (this.operation != null) {
            this.previousOperandElement.innerText =
                `${this.formatNumber(this.previousOperand)} ${this.operation}`
        } else {
            this.previousOperandElement.innerText = ''
        }
    }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previousOperand')
const currentOperandElement = document.getElementById('currentOperand')
const calculator = new Calculator(previousOperandElement, currentOperandElement)

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText)
        calculator.updateDisplay()
    })
})

// Operator buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.classList.remove('active')
        })
        // Add active class to clicked button
        button.classList.add('active')

        calculator.chooseOperation(button.innerText)
        calculator.updateDisplay()
    })
})

// Equals button
document.querySelector('[data-equals]').addEventListener('click', () => {
    // Remove active class from all operator buttons
    document.querySelectorAll('[data-operator]').forEach(btn => {
        btn.classList.remove('active')
    })

    calculator.compute()
    calculator.updateDisplay()
})

// Clear button
document.querySelector('[data-clear]').addEventListener('click', () => {
    // Remove active class from all operator buttons
    document.querySelectorAll('[data-operator]').forEach(btn => {
        btn.classList.remove('active')
    })

    calculator.clear()
    calculator.updateDisplay()
})

// Delete button
document.querySelector('[data-delete]').addEventListener('click', () => {
    calculator.delete()
    calculator.updateDisplay()
})

// Clear history button
document.getElementById('clearHistory').addEventListener('click', () => {
    calculator.clearHistory()
})

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key)
        calculator.updateDisplay()
    }

    if (e.key === '+' || e.key === '-') {
        calculator.chooseOperation(e.key)
        calculator.updateDisplay()
    }

    if (e.key === '*') {
        calculator.chooseOperation('×')
        calculator.updateDisplay()
    }

    if (e.key === '/') {
        e.preventDefault()
        calculator.chooseOperation('÷')
        calculator.updateDisplay()
    }

    if (e.key === '%') {
        calculator.chooseOperation('%')
        calculator.updateDisplay()
    }

    if (e.key === 'Enter' || e.key === '=') {
        calculator.compute()
        calculator.updateDisplay()
    }

    if (e.key === 'Backspace') {
        calculator.delete()
        calculator.updateDisplay()
    }

    if (e.key === 'Escape') {
        calculator.clear()
        calculator.updateDisplay()
    }
})

// Initial display update
calculator.updateDisplay()