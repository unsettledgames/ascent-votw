
function toArray(arr)
{
	return Array.prototype.slice.call(arr);
}

let body = document.querySelector("body");

// Cookies banner
let cookiesBox = document.querySelector(".cookies-box");
let cookiesBoxConfirm = cookiesBox.querySelector(".confirm");

if(sessionStorage.getItem("cookiesAccepted") == "yes") {
	cookiesBox.style.display = "none";
}
cookiesBoxConfirm.addEventListener("click", () => {
	cookiesBox.style.display = "none";
	sessionStorage.setItem("cookiesAccepted", "yes");
});

// Make screenshots clickable
if(document.querySelector("#image-popup"))
{
	let currentScreenshotNumber = null;
	let screenshots = toArray(document.querySelectorAll(".image-item"));
	let imgPopupContainer = document.querySelector("#image-popup");
	let imgPopup = imgPopupContainer.querySelector("img");
	let leftArrow = document.querySelector("#image-popup .button-left");
	let rightArrow = document.querySelector("#image-popup .button-right");


	// Open image popup
	for(let i=0; i<screenshots.length; i++)
	{
		screenshots[i].onclick = function()
		{
			currentScreenshotNumber = i;
			imgPopup.src = screenshots[i].src;
			imgPopupContainer.classList.add("open");
		}
	}

	// Hide image popup
	imgPopup.onclick = function()
	{
		imgPopupContainer.classList.remove("open");
	}

	// Prev/next screenshot
	leftArrow.onclick = function()
	{
		if(currentScreenshotNumber == 0) {
			currentScreenshotNumber = screenshots.length-1;
		}
		else {
			currentScreenshotNumber--;
		}
		imgPopup.src = screenshots[currentScreenshotNumber].src;
	}
	rightArrow.onclick = function()
	{
		if(currentScreenshotNumber == screenshots.length-1) {
			currentScreenshotNumber = 0;
		}
		else {
			currentScreenshotNumber++;
		}
		imgPopup.src = screenshots[currentScreenshotNumber].src;
	}

}


// Make videos clickable
if(document.querySelector("#video-popup"))
{
	let currentVideoNumber = null;
	let videos = toArray(document.querySelectorAll(".video-item"));
	let videoPopupContainer = document.querySelector("#video-popup");
	let videoPopup = videoPopupContainer.querySelector("iframe");

	// Set video thumbnail
	for(let i=0; i<videos.length; i++)
	{
		let youtubeVideoID = videos[i].getAttribute('data-source');
		videos[i].src = "https://img.youtube.com/vi/"+youtubeVideoID+"/mqdefault.jpg";
	}

	// Open video popup
	for(let i = 0; i < videos.length; i++)
	{
		videos[i].addEventListener("click", () =>
		{
			currentVideoNumber = i;
			videoPopup.src = "https://www.youtube.com/embed/" + videos[i].getAttribute('data-source');
			videoPopupContainer.classList.add("open");
		});
	}

	// Close video popup
	videoPopupContainer.onclick = function()
	{
		videoPopup.src = '';
		videoPopupContainer.classList.remove("open");
	}
}


// Dropdown menu for small screens
let navMenu = document.querySelector("nav");

navMenu.addEventListener("click", () =>
{
	if(navMenu.classList.contains("open")) {
		navMenu.classList.remove("open");
	}
	else {
		navMenu.classList.add("open");
	}
});




function loadHTML(URL, onLoad)
{
	let XHR = new XMLHttpRequest();
	XHR.onload = function()
	{
		if(this.status == 200)
		{
			let domparser = new DOMParser();
			let response = domparser.parseFromString(XHR.response, "text/html");
			onLoad(response);
		}
	}
	XHR.open("GET", URL);
	XHR.send();
}


function loadNewsPreview(itemCount, newsItems)
{
	loadHTML(newsItems[itemCount].href, function(HTMLitem)
	{
		newsItems[itemCount].style.display = "flex";

		newsItemImage = HTMLitem.querySelector(".banner");
		newsItemTitle = HTMLitem.querySelector(".title");

		// Fix relative image path
		let images = toArray(HTMLitem.querySelectorAll("img"));
		for(let i=0; i<images.length; i++)
		{
			images[i].src = images[i].src.replace("images/", "news/images/");
		}

		let newsItemContent = document.createElement("div");
		newsItemContent.classList.add("content");
		
		let newsItemExcerpt = document.createElement("div");
		newsItemExcerpt.classList.add("excerpt");

		// Generate excerpt
		let excerpt = HTMLitem.querySelector(".content").innerText.slice(0, 200);

		for(let charCount = 0;
			charCount < excerpt.length;
			charCount++)
		{
			if(excerpt[excerpt.length-1] == " ") {
				excerpt = excerpt.slice(0, -1);
				excerpt += "...";
				break;
			}
			else {
				excerpt = excerpt.slice(0, -1);
			}
		}
		newsItemExcerpt.innerHTML = excerpt;

		// Append everything
		if(!!newsItemImage)
		{
			newsItems[itemCount].appendChild(newsItemImage);
		}

		newsItemContent.appendChild(newsItemTitle);
		newsItemContent.appendChild(newsItemExcerpt);
		newsItems[itemCount].appendChild(newsItemContent);
	});

	// Prevent news item from redirecting
	newsItems[itemCount].dataSource = newsItems[itemCount].href;
	newsItems[itemCount].removeAttribute("href");


	// Clicking a news item
	newsItems[itemCount].addEventListener("click", function()
	{
		openNewsPopup(newsItems[itemCount].dataSource);
		window.location.hash = "#" + newsItems[itemCount].dataSource.split('/').pop().replace('.html', '');
	});
}

// Go through the news-item links and generate them
if(document.querySelector(".news"))
{
	let newsItems = toArray(document.querySelectorAll("section.news .news-item"));
	let loadMoreButton = document.querySelector(".load-more-btn");
	let loadedNewsCount = 0;
	let newsPerLoad = 5;
	let closeButton = document.querySelector(".close-button");
	let newsPopupContent = document.querySelector(".news-popup .news-item");
	
	if(window.location.hash)
	{
		openNewsPopup("news/" + window.location.hash.replace("#", '') + ".html");
	}

	if(newsPerLoad >= newsItems.length) {
		loadMoreButton.style.display = "none";
	}

	for(let itemCount = 0; itemCount < newsPerLoad; itemCount++)
	{
		if(itemCount < newsItems.length) {
			loadNewsPreview(itemCount, newsItems);
		}
		else {
			break;
		}
	}
	loadedNewsCount += newsPerLoad;

	loadMoreButton.addEventListener("click", () => {
		for(let i = 0; i < newsPerLoad; i++)
		{
			if(i + loadedNewsCount < newsItems.length) {
				loadNewsPreview(loadedNewsCount + i, newsItems);
				console.log(loadedNewsCount);
			}
			else {
				loadMoreButton.style.display = "none";
				break;
			}
		}
		loadedNewsCount += newsPerLoad;
	});

	function openNewsPopup(newsItemSource)
	{
		body.classList.add("popup-open");

		if(newsPopupContent.dataSource != newsItemSource)
		{
			newsPopupContent.dataSource = newsItemSource;
			newsPopupContent.innerHTML = "";

			loadHTML(newsItemSource, function(HTMLitem)
			{
				// Fix relative image path
				let images = toArray(HTMLitem.querySelectorAll("img"));
				for(let i=0; i<images.length; i++)
				{
					images[i].src = images[i].src.replace("images/", "news/images/");
				}

				let newsItemTitle = HTMLitem.querySelector(".title");
				let newsItemSubtitle = HTMLitem.querySelector(".subtitle");
				let newsItemContent = HTMLitem.querySelector(".content");

				newsPopupContent.appendChild(newsItemTitle);
				newsPopupContent.appendChild(newsItemSubtitle);
				newsPopupContent.appendChild(newsItemContent);
			});
		}
	}

	closeButton.addEventListener("click", () =>
	{
		body.classList.remove("popup-open");
		window.location.hash = '';
	});
}