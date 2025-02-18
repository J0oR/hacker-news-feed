import { appendArticles } from './card.js';
import logoImg from '../imgs/hat.png';
import axios from "axios";
import '../scss/style.scss';
import { debounce, forOwn } from 'lodash';

const itemUrl = process.env.ITEM_URL;
let allIds = [];
let offset = 0;
const articlesContainer = document.querySelector('.articles-container');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more-button');
const newStoriesButton = document.querySelector('.new-stories-btn');
const topStoriesButton = document.querySelector('.top-stories-btn');
const bestStoriesButton = document.querySelector('.best-stories-btn');
const apiUrls = {
    new: process.env.NEW_URL,
    top: process.env.TOP_URL,
    best: process.env.BEST_URL,
};
const categoryButtons = { new: newStoriesButton, top: topStoriesButton, best: bestStoriesButton };
document.querySelector('.logo').src = logoImg;

/*
 * FETCH THE LIST OF ARTICLE IDS ONCE ON THE FIRST PAGE LOAD
 */
async function fetchArticleIds(url) {
    try {
        articlesContainer.style.backgroundColor = 'transparent';
        // set the loading spinner and clear the articles container
        toggleLoaderAndButtonVisibility('block', 'none');
        articlesContainer.innerHTML = '';
        // Fetch & store all the article IDs and Load the first batch of article details 
        allIds = (await axios.get(url)).data;
        offset = 0;
        loadNextBatch();
    } catch (error) {
        console.error('Error fetching article IDs:', error);
    }
}

/*
 * FETCH DETAILS FOR THE NEXT BATCH OF 10 ARTICLES BASED ON THE CURRENT OFFSET
 */
async function loadNextBatch() {
    try {
        
        // Get the next batch of article IDs & URLs
        const nextBatchIds = allIds.slice(offset, offset + 10);
        offset += 10;
        const nextBatchUrls = nextBatchIds.map(id => `${itemUrl}${id}.json`);
        // Fetch article details for the next batch
        const responses = await Promise.all(nextBatchUrls.map(url => axios.get(url)));
        const data = _.map(responses, 'data');
        // Append the articles to the DOM & toggle visibility of loader and load more button
        appendArticles(data, offset);
        toggleLoaderAndButtonVisibility('none', 'block');
        //articlesContainer.style.display = 'block';
        articlesContainer.style.backgroundColor = '#273F42';


    } catch (error) {
        console.error('Error loading next batch:', error);
    }
}

/*
 * NAVIGATION FUNCTIONALITY
 */
function setUpNavigation() {
    // Iterate over each category button
    _.forOwn(categoryButtons, function (button, category) {
        // Add event listener to each button
        button.addEventListener('click', async () => {
            // Remove active & disabled class from all buttons using lodash
            _.forOwn(categoryButtons, button => {
                button.classList.remove('active');
                button.disabled = false;
            });
            // Add active & disabled class to the clicked button
            button.classList.add('active');
            button.disabled = true;
            articlesContainer.style.backgroundColor = 'transparent';
            // Fetch article IDs based on the category
            await fetchArticleIds(apiUrls[category]);
        });
    });
}

/*
 * TOGGLE LOADER AND LOAD MORE BUTTON VISIBILITY
 */
function toggleLoaderAndButtonVisibility(loaderDisplay, loadMoreButtonDisplay) {
    loader.style.display = loaderDisplay;
    loadMoreButton.style.display = loadMoreButtonDisplay;
}

/*
 * INITIALIZE THE PAGE
 */
window.addEventListener('DOMContentLoaded', async () => {
    articlesContainer.style.backgroundColor = 'transparent';
    // Display the loader and hide the load more button initially
    toggleLoaderAndButtonVisibility('block', 'none');
    // Set up navigation functionality
    setUpNavigation();
    // Fetch data before rendering the page
    await fetchArticleIds(process.env.NEW_URL);
    // Add event listener to the load more button
    loadMoreButton.addEventListener('click', _.debounce(() => {
        toggleLoaderAndButtonVisibility('block', 'none');
        loadNextBatch();
    }, 300));
});