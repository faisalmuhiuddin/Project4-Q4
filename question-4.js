const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const blogUrl = 'https://blog.ankitsanghvi.in/';

async function scrapeBlogs() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(blogUrl);

    const blogLinks = await page.evaluate(()=>{
      const blogCards = document.querySelectorAll('.post-feed > article');
      return Array.from(blogCards).map(card => ({
        title: card.querySelector('div > a > header > h2').textContent.trim(),
        link: card.querySelector('div > a').href
      }));
    });

    const blogData = [];

    for (const blog of blogLinks) {
      await page.goto(blog.link);
      const content = await page.evaluate(() => {
        const article = document.querySelector('.post-content');
        return article ? article.textContent.trim() : '';
      });
      blogData.push({ title: blog.title, content: content });
    }

    const csvWriter = createCsvWriter({
      path: 'blogdata.csv',
      header: [{ id: 'title', title: 'Title' }, { id: 'content', title: 'Content' }]
    });
    await csvWriter.writeRecords(blogData);

    console.log('Scraping completed successfully!');
    await browser.close();
  } 
  catch (error) {
    console.error('Error found during scraping:', error);
  }
}

scrapeBlogs();
