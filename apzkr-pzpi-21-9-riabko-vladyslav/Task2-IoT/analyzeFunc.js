function analyzeFunc(msg) {
    let status = 'allowed';
    let errorMessage = 'No issues detected';

    const results = [msg.payload];
    results.forEach(result => {
        if (result.result.includes('detected')) {
            status = 'warned';
            errorMessage = result.result;
        }
    });

    msg.payload = { status, error: errorMessage, results: results };
    return msg;
}
