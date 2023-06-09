const menu = document.getElementById('menu');
menu.className = 'momo';

const loadingIndicator = document.getElementById('loadingIndicator');

showLoadingIndicator();

fetch('https://simplenews-bbb17-default-rtdb.europe-west1.firebasedatabase.app/arabshorts/xmls.json?shallow=true')
    .then(response => response.json())
    .then(data => {
        // Count the number of keys in the data object
        const keys = Object.keys(data);
        const keysCount = keys.length;

        // Loop through each key and create an <a> element for the menu
        keys.forEach((key, index) => {
            const menuItem = document.createElement('a');

            let keyName = key
            const parts = key.split('_');
            if (parts.length > 3) {
                keyName = parts[2];
            } else {
                keyName = parts[1];
            }

            menuItem.textContent = keyName.toUpperCase();
            menuItem.href = `${index + 1}`; // Use index + 1 as the href value

            menuItem.addEventListener('click', event => {
                event.preventDefault();
                const hrefValue = event.target.getAttribute('href');
                fetchData(hrefValue);
                handleMenuItemClick(event)
            });

            menu.appendChild(menuItem);
        });
        hideLoadingIndicator();
        fetchData('0')
        console.log('Number of keys:', keysCount);
    })
    .catch(error => {
        console.error('Error:', error);
    });


function fetchData(hrefValue) {
    // Get the "items" div where the content will be displayed
    const itemsContainer = document.getElementById('items');
    itemsContainer.className = 'items';
    itemsContainer.innerHTML = '';

    showLoadingIndicator();
    // Fetch the JSON data
    fetch('https://simplenews-bbb17-default-rtdb.europe-west1.firebasedatabase.app/arabshorts/xmls.json')
        .then(response => response.json())
        .then(data => {


            // Get the items array from the JSON data
            const items = Object.values(data)[hrefValue]?.rss?.channel?.item; // Extract the first key's value


            // Check if items array exists
            if (Array.isArray(items)) {
                // Loop through each item and extract the necessary properties
                items.forEach(item => {
                    const title = item.title?._t;
                    const pubdate = item.pubDate?._t;
                    let description = item.description?._t;
                    if (!description) {
                        description = item.description?._cd;
                    }
                    const link = item.link?._t;
                    let image = item.enclosure?.url;

                    if (!image) {
                        // Make an HTTP request to the link
                        fetch(link)
                            .then(response => response.text())
                            .then(html => {
                                // Extract the image thumbnail from the HTML response
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(html, "text/html");
                                const imgElement = doc.querySelector("img");

                                if (imgElement) {
                                    image = imgElement.src;
                                    // Use the image URL here or assign it to a variable
                                } else {
                                    // Handle the case where no image thumbnail is found
                                    console.log("No image thumbnail found.");
                                }
                            })
                            .catch(error => {
                                // Handle any error that occurs during the HTTP request
                                console.log("Error fetching image thumbnail:", error);
                            });
                    } else {
                        // Use the existing image URL
                    }


                    // Create the HTML elements to display the item
                    const itemElement = document.createElement('div');
                    itemElement.className = 'item';

                    var imageContainer = document.createElement('div');
                    imageContainer.className = 'image-container';
                    const imageElement = document.createElement('img');
                    imageElement.src = image;
                    imageContainer.appendChild(imageElement);

                    const contentElement = document.createElement('div');
                    contentElement.className = 'content';

                    const titleElement = document.createElement('h2');
                    titleElement.textContent = title;

                    const descriptionElement = document.createElement('p');
                    const sanitizedContent = description.replace(/<img\b[^>]*>/gi, '');
                    descriptionElement.innerHTML = sanitizedContent;

                    const linkElement = document.createElement('a');
                    linkElement.href = link;
                    linkElement.target = "_blank";
                    linkElement.textContent = 'اقرأ المزيد ...';

                    // Append the elements to the container
                    contentElement.appendChild(titleElement);
                    contentElement.appendChild(descriptionElement);
                    contentElement.appendChild(linkElement);

                    itemElement.appendChild(imageContainer);
                    itemElement.appendChild(contentElement);

                    itemsContainer.appendChild(itemElement);
                    hideLoadingIndicator();
                });

            } else {
                console.error('Invalid JSON structure');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to show the loading indicator
function showLoadingIndicator() {
    loadingIndicator.classList.add('show-loading');
}

// Function to hide the loading indicator
function hideLoadingIndicator() {
    loadingIndicator.classList.remove('show-loading');
}

function handleMenuItemClick(event) {
    const menuItems = document.querySelectorAll('.momo a');

    // Remove the "selected" class from all menu items
    menuItems.forEach(item => {
        item.classList.remove('selected');
    });

    // Add the "selected" class to the clicked menu item
    event.target.classList.add('selected');
}
