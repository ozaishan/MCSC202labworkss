const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use("/img", express.static("img"));
// Configure EJS as the view engine
app.set('view engine', 'ejs');



// Parse form data
app.use(express.urlencoded({ extended: false }));


// Define the main route
app.get('/', (req, res) => {
    // Render the 'index' view with empty iterations and no root initially
    res.render('index', { iterations: [], root: null });
});

// Define the route for calculating the root using Secant method
app.post('/calculate-secant', (req, res) => {
    // Get user inputs
    const { expression, a, b, tolerance } = req.body;
    
    // Calculate iterations and the root using the Secant method
    const iterations = secantMethod(parseFloat(a), parseFloat(b), parseFloat(tolerance), expression);
    const root = iterations.length > 0 ? iterations[iterations.length - 1].xn : null;

    // Render the 'index' view with the calculated iterations and root
    res.render('index', { iterations, root, a, b });
});

const math = require('mathjs');

// Function to perform the Secant method
function secantMethod(a, b, tolerance, expression) {
    const iterations = [];
    let xnMinus1 = a;
    let xn = b;
    let fxnMinus1 = evaluateExpression(expression, xnMinus1);
    let fxn = evaluateExpression(expression, xn);
    let iteration = 0;

    do {
        // Calculate the new approximation x2 using the Secant method formula
        const xnPlus1 = xn - (fxn * (xn - xnMinus1)) / (fxn - fxnMinus1);
        const fxnPlus1 = evaluateExpression(expression, xnPlus1);

        // Push the iteration details to the 'iterations' array
        iterations.push({
            iteration: iteration + 1,
            a: xnMinus1.toFixed(4),
            b: xn.toFixed(4),
            fa: fxnMinus1.toFixed(4),
            fb: fxn.toFixed(4),
            xn: xnPlus1.toFixed(4),
            fxn: fxnPlus1.toFixed(4),
        });

        // Update variables for the next iteration
        xnMinus1 = xn;
        xn = xnPlus1;
        fxnMinus1 = fxn;
        fxn = fxnPlus1;

        iteration++;
    } while (Math.abs(fxn) > tolerance && iteration < 100);

    return iterations;
}

// Function to evaluate a mathematical expression with a given value
function evaluateExpression(expression, x) {
    try {
        const scope = { x };
        const compiledExpression = math.compile(expression);
        const result = compiledExpression.evaluate(scope);
        return result;
    } catch (error) {
        throw new Error("Invalid expression: " + error.message);
    }
}

// Start the Express server on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
