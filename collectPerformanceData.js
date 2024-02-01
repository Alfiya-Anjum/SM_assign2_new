const puppeteer = require('puppeteer');
const fs = require('fs');


(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Path to Chrome
      headless: true
      
    });
    const page = await browser.newPage();
  //URL to be tested
  const url = 'https://en.wikipedia.org/wiki/Software_metric';

  let allMetrics = [];
  
  for (let i = 0; i < 10; i++) {
    await page.goto(url, { waitUntil: 'load' });
    
    //performance entries
    const performanceEntries = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.getEntries()))
    );

    allMetrics.push(performanceEntries);
  }
  // Process to calculate average metrics
  let averageMetrics = calculateAverages(allMetrics);

  // Prettify the JSON output
  fs.writeFileSync('performance_metrics.json', JSON.stringify(allMetrics, null, 2));

  // Converts to CSV format
  let csvContent = "name,duration\n";
  averageMetrics.forEach(metric => {
    csvContent += `${metric.name},${metric.duration}\n`;
  });

  // CSV content to a file
  fs.writeFileSync('performance_metrics.csv', csvContent);

  await browser.close();

  // Calculates averages function
  function calculateAverages(allMetrics) {
    let sums = {}, counts = {}, results = [];
    // Sums up all metrics and count entries for averaging
    allMetrics.flat().forEach(entry => {
      sums[entry.name] = (sums[entry.name] || 0) + entry.duration;
      counts[entry.name] = (counts[entry.name] || 0) + 1;
    });
    // Calculates average duration for each entry
    for (let name in sums) {
      results.push({ name: name, duration: sums[name] / counts[name] });
    }
    return results;
  }
})();
