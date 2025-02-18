import { get } from 'lodash';
const articlesContainer = document.querySelector('.articles-container');

/*
 * RETURNS THE TIME SINCE THE GIVEN TIMESTAMP
 */
function timeAgo(timestamp) {
    // Calculate the difference in seconds between the current time and the timestamp
    const diff = Math.floor(Date.now() / 1000 - timestamp);
    // Define the units of time
    const units = [
        { label: "day", value: 86400 },
        { label: "hour", value: 3600 },
        { label: "minute", value: 60 },
    ];
    // Iterate over the units
    for (const unit of units) {
        // Calculate the amount of units that fit into the difference
        const amount = Math.floor(diff / unit.value);
        // If the amount is greater than or equal to 1, return the amount and unit label
        if (amount >= 1) return `${amount} ${unit.label}${amount !== 1 ? 's' : ''} ago`;
    }
    // If the difference is less than 60 seconds, return the difference and 'second(s) ago'
    return `${diff} second${diff !== 1 ? 's' : ''} ago`;
}

/*
 * CREATE A CARD ELEMENT
 */
function createCard(article) {
    // Create a card element
    const card = document.createElement('a');
    card.classList.add('card');
    card.href = _.get(article, 'url', `https://news.ycombinator.com/item?id=${_.get(article, 'id')}`);
    card.target = '_blank';
    // Set the inner HTML of the card
    card.innerHTML = `
        <h3 class="card-title">${_.get(article, 'title', 'No Title')}</h3>
        <div class="card-details">
            <p class="card-author">by ${_.get(article, 'by', 'Unknown')}</p>
            <p>•</p>
            <p class="card-time">${timeAgo(_.get(article, 'time'))}</p>
        </div>
    `;
    return card;
}


/*
 * CREATE AND APPEND ARTICLE CARDS TO THE DOM
 */
export function appendArticles(data, offset) {
    // Create a card for each article & set animation delay
    const cards = _.compact(data.map((article, index) => {
            const card = createCard(article);
            card.style.animationDelay = `${index * 0.1}s`; 
            return card;
    }))
    // Append the cards to the articles container
    articlesContainer.append(...cards);
    // Scroll to the first card of the new batch, but only if it's not the first batch
    if (cards.length > 0 && offset > 10) {
        setTimeout(() => {
            cards[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }
}