function getScanResult(detectionValue) {
    const scanResults = [
        'Contraband items detected: Suspicious powder found',
        'Explosive material detected: Dangerous substance found',
        'Contraband items detected: Suspicious object found',
        'Unusual density detected: Hidden compartment suspected',
        'Temperature discrepancy detected: Abnormal heat source found',
        'Clear'
    ];

    const detectionIndex = Math.floor(detectionValue * (scanResults.length - 1));
    const result = detectionValue < 1 ? scanResults[detectionIndex] : scanResults[scanResults.length - 1];

    return { result: result };
}

const detectionValue = 0.25; 
const scanResult = getScanResult(detectionValue);
console.log(scanResult);