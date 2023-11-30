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
app.get('/qn1', (req, res) => {
    const a = 0.5;
    const b = 1.0;

    // Calculate bisection method iterations
    const { iterations, root } = bisectionMethod(a, b, 0.0001);


    // Render the 'qn1' view with the calculated iterations
    res.render('qn1', { iterations,root, a, b });
});
function bisectionMethod(a, b, tolerance) {
    const iterations = [];
    let fa = evaluateEquation(a);
    let fb = evaluateEquation(b);
    let root = null;  // Initialize root as null

    if (fa * fb >= 0) {
        throw new Error('The bisection method may not converge because f(a) and f(b) have the same sign.');
    }

    let iteration = 0;

    do {
        const c = (a + b) / 2;
        const fc = evaluateEquation(c);

        iterations.push({
            iteration: iteration + 1,
            a: a.toFixed(4),
            b: b.toFixed(4),
            c: c.toFixed(4),
            fa: fa.toFixed(4),
            fb: fb.toFixed(4),
            fc: fc.toFixed(4),
        });

        if (Math.abs(fc) < tolerance) {
            root = c;
             // Set root if fc is very close to 0
            break;
        } else if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }

        iteration++;
    } while (Math.abs(b - a) > tolerance && iteration < 100);

    return { iterations, root };
    // Function to evaluate the given equation
function evaluateEquation(x) {
    try {
        return math.evaluate('x^2 - sin(x)', { x });
    } catch (error) {
        throw new Error("Invalid expression: " + error.message);
    }
}
}
app.get('/qn2', (req, res) => {
    const x0 = 1.0;

    // Calculate Newton-Raphson method iterations
    const { iterations, root } = newtonsRaphsonMethod(x0, 0.0001);

    // Render the 'qn2' view with the calculated iterations
    res.render('qn2', { iterations, root, x0 });
});

function newtonsRaphsonMethod(x0, tolerance) {
    const iterations = [];
    let x = x0;
    let root = null;  // Initialize root as null

    let iteration = 0;
    let fx;  // Declare fx variable outside the loop

    do {
        fx = evaluateEquation(x);  // Assign value to fx
        const fprimeX = evaluateDerivative(x);

        iterations.push({
            iteration: iteration + 1,
            x: x.toFixed(4),
            fx: fx.toFixed(4),
            fprimeX: fprimeX.toFixed(4),
        });

        if (Math.abs(fx) < tolerance) {
            root = x;
            // Set root if fx is very close to 0
            break;
        }

        x = x - fx / fprimeX;

        iteration++;
    } while (Math.abs(fx) > tolerance && iteration < 100);

    return { iterations, root };
}
    function evaluateEquation(x) {
    try {
        return Math.exp(x) - 4 * x;
    } catch (error) {
        throw new Error("Invalid expression: " + error.message);
    }
}

// Function to evaluate the derivative of the given equation
function evaluateDerivative(x) {
    try {
        return Math.exp(x) - 4;
    } catch (error) {
        throw new Error("Invalid expression: " + error.message);
    }
}


app.get('/qn3', (req, res) => {
    // Define the function y = e^x
    function y(x) {
        return Math.exp(x);
    }
   // Calculate finite differences until a constant value is reached
function finiteDifferenceTable(xValues, h) {
    const n = xValues.length;
    const table = new Array(n).fill().map(() => new Array(n + 1).fill(0));

    // Fill in the x values
    for (let i = 0; i < n; i++) {
        table[i][0] = xValues[i];
    }

    // Fill in the function values y(x)
    for (let i = 0; i < n; i++) {
        table[i][1] = y(xValues[i]);
    }

    // Calculate finite differences until a constant value is reached
    for (let j = 2; j <= n; j++) {
        for (let i = 0; i <= n - j; i++) {
            table[i][j] = table[i + 1][j - 1] - table[i][j - 1];
        }

        // Check if all values in the current column are the same (indicating a constant value)
        if (table.every((row, rowIndex) => {
            return rowIndex <= n - j || (typeof row[j] === 'number' && row[j] === table[0][j]);
        })) {
            break;
        }
    }

    return table;
}
    // Define the interval and step size
    const intervalStart = -1;
    const intervalEnd = 1;
    const stepSize = 0.1;

    // Generate equally spaced x values
    const xValues = Array.from({ length: Math.ceil((intervalEnd - intervalStart) / stepSize) + 1 }, (_, i) => intervalStart + i * stepSize);

    // Calculate finite difference table
    const table = finiteDifferenceTable(xValues, stepSize);

    // Render the EJS template with the calculated table
    res.render('qn3', { table });
});
const xValues = [0.20, 0.22, 0.24, 0.26, 0.28, 0.30];
const yValues = [1.6596, 1.6698, 1.6804, 1.6912, 1.7024, 1.7139];

// Newton's forward interpolation
function forwardInterpolation(x, xValues, yValues) {
    const n = xValues.length;
    let result = yValues[0];
    let term = 1;

    for (let i = 1; i < n; i++) {
        term *= (x - xValues[i - 1]) / (xValues[i] - xValues[i - 1]);
        result += term * yValues[i];
    }

    return result;
}

// Newton's backward interpolation
function backwardInterpolation(x, xValues, yValues) {
    const n = xValues.length;
    let result = yValues[n - 1];
    let term = 1;

    for (let i = 1; i < n; i++) {
        term *= (x - xValues[n - i]) / (xValues[n - i - 1] - xValues[n - i]);
        result += term * yValues[n - i - 1];
    }

    return result;
}

app.get('/qn4', (req, res) => {
    const x1 = 0.21;
    const x2 = 0.29;
    let n = 6;
    let twoDArray = [
        ['x', 'y', 'diff:1', 'diff:2', 'diff:3', 'diff:4', 'diff:5'],
        [0.20, 1.6596, 0, 0, 0, 0, 0],
        [0.22, 1.6698, 0, 0, 0, 0, 0],
        [0.24, 1.6804, 0, 0, 0, 0, 0],
        [0.26, 1.6912, 0, 0, 0, 0, 0],
        [0.28, 1.7024, 0, 0, 0, 0, 0],
        [0.30, 1.7139, 0, 0, 0, 0, 0],
    ];

    let h = 0.2;
    let i;
    let j;

    for (j = 2; j <= n; j++) {
        for (i = 1; i <= n - j + 1; i++) {
            let a = i;
            let b = j - 1;
            let a1 = i + 1;
            twoDArray[i][j] = (twoDArray[a1][b] - twoDArray[a][b]).toFixed(4);
        }
    }

    let x0 = twoDArray[1][0];
    let xn = twoDArray[6][0];

    let p1= (x1-x0)/h;
    let p2= (x2-xn)/h;

    let o1= 1;
    let o2= 1;

    let fvalforward = parseFloat(twoDArray[1][1]) ;
    let fvalbackward = parseFloat(twoDArray[6][1]) ;

    //Newton's forward interpolation calculation
    for(i=0; i<5; i++)
    {
        o1 = o1* (p1-i);
        fvalforward = fvalforward + (o1.toFixed(5)*(twoDArray[1][i+2])/(math.factorial(i+1)));
    }

    //Newton's backward interpolation calculation
    for(i=0; i<5; i++)
    {
        o2 = o2* (p2+i);
        fvalbackward = fvalbackward + (o2.toFixed(5)*(twoDArray[n-i-1][i+2])/(math.factorial(i+1))) ;
    }

    // Generating HTML table
    let htmlTable = '<table border="1">';
    for (i = 0; i <= n; i++) {
        htmlTable += '<tr>';
        for (j = 0; j <= 6; j++) {
            htmlTable += `<td>${twoDArray[i][j]}</td>`;
        }
        htmlTable += '</tr>';
    }
    htmlTable += '</table>';

    console.log("2D Array:", twoDArray);

    res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>Newton's Interpolation</title>
            <link rel="stylesheet" type="text/css" href="css/styles.css" />
        </head>
        <body background="resources/mcsc.png">
            <b>
            <h1>Newton's Interpolation </h1>
            <h1>Solver</h1>
                    <form id="solver-form" action="/" method="post">
                    <div class="prev">
                    <p>The finite difference table is shown below:</p>
                    <p>The interval difference is: ${h}</p>
                    <p>p-value for x=${x1} is: ${p1.toFixed(2)}</p>
                    <p>p-value for x=${x2} is: ${p2.toFixed(2)}</p>
                    </div>
                    <div class="text2">
                    <p>${htmlTable}</p>
                    <p>The value of f(${x1}) using Newton's Forward Interpolation is: ${fvalforward.toFixed(5)}</p>
                    <p>The value of f(${x2}) using Newton's Backward Interpolation is: ${fvalbackward.toFixed(5)}</p>
                    <center>
                        <input type="submit" class="btn1" value="Back">    
                    </center>
                    </div>
                    </form>
                   
            </b>
        </body>
        </html>`);
});
// Start the Express server on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
