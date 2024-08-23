$(document).ready(function () {
  const newsApiKey = "3ae9a9deb3744126acc066f349084b1b"; // Replace with your News API key

  // Function to handle search button click
  $("#search-button").click(function () {
    const ticker = $("#search-bar").val().trim();
    if (ticker) {
      fetchStockData(ticker); // Call function to fetch stock data
      clearSearchBar(); // Clear search bar after fetching data

      // Set up interval to refresh the current price every 5 seconds
      setInterval(() => fetchStockData(ticker), 1000);

      // Scroll to the stock section after initiating search
      scrollToSection("#features");
    } else {
      alert("Please enter a stock ticker symbol.");
    }
  });

  // Function to fetch stock data from server
  function fetchStockData(ticker) {
    $.ajax({
      url: "/get_stock_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ ticker: ticker, exchange: "NSE" }), // Sending ticker and exchange data
      success: function (response) {
        if (response.error) {
          alert(response.error); // Display error if any
        } else {
          console.log("Data received:", response); // Debugging line

          // Update UI with stock data
          updateStockInfo(response, ticker);

          // Apply conditional styling based on profit/loss
          applyStockStyling(response.currentPrice, response.openPrice);
        }
      },
      error: function (xhr) {
        console.error("Failed to fetch stock data:", xhr); // Log error to console
        alert("Failed to fetch stock data. Please try again later."); // Show alert to user
      },
    });
  }

  // Function to update stock information in the UI
  function updateStockInfo(data, ticker) {
    // Calculate percentage change
    const currentPrice = parseFloat(data.currentPrice);
    const openPrice = parseFloat(data.openPrice);
    const percentageChange = (
      ((currentPrice - openPrice) / openPrice) *
      100
    ).toFixed(2);

    // Determine profit or loss
    let profitOrLoss;
    if (currentPrice > openPrice) {
      profitOrLoss = "positive-change";
    } else if (currentPrice < openPrice) {
      profitOrLoss = "negative-change";
    } else {
      profitOrLoss = "no-change";
    }

    // Update existing stock info box or create a new one
    const stockBox = $(`.stock-box[data-ticker="${ticker}"]`);
    if (stockBox.length) {
      stockBox.find("#current-price").text(data.currentPrice).removeClass("positive-change negative-change no-change").addClass(profitOrLoss);
      stockBox.find(".percentage-change").text(`${percentageChange}%`).removeClass("positive-change negative-change no-change").addClass(profitOrLoss);
    } else {
      const stockInfoBox = `
        <div class="stock-box ${profitOrLoss}" data-ticker="${ticker}">
          <div class="stock-info">
            <h2><strong>STOCK NAME:</strong> <span id="stock-name">${ticker}</span></h2>
            <p><strong>Current Price:</strong> <span id="current-price" class="${profitOrLoss}">${data.currentPrice}</span></p>
            <p><strong>Open Price:</strong> <span id="open-price">${data.openPrice}</span></p>
            <p><strong>Percentage Change:</strong> <span class="percentage-change ${profitOrLoss}">${percentageChange}%</span></p>
            <p><strong>Recommendation:</strong> <span id="recommendation">${data.recommendation}</span></p>
          </div>
        </div>
      `;
      $(".stock-container").append(stockInfoBox);
    }

    // Fetch and display news articles after updating stock info
    fetchNewsArticles(ticker);
  }

  // Function to clear search bar after fetching data
  function clearSearchBar() {
    $("#search-bar").val(""); // Clears the input field
  }

  // Function to apply conditional styling based on profit/loss
  function applyStockStyling(currentPrice, openPrice) {
    const percentageChange = (
      ((currentPrice - openPrice) / openPrice) *
      100
    ).toFixed(2);

    // Determine the color class based on percentage change
    let percentageColorClass;
    if (percentageChange > 0) {
      percentageColorClass = "positive-change";
    } else if (percentageChange < 0) {
      percentageColorClass = "negative-change";
    } else {
      percentageColorClass = "no-change"; // Optional: handle zero change differently if needed
    }

    // Update color class for current price and percentage change elements
    $("#current-price").removeClass("positive-change negative-change no-change").addClass(percentageColorClass);
    $(".percentage-change").removeClass("positive-change negative-change no-change").addClass(percentageColorClass);
  }

  // Function to scroll to a specific section by its ID
  function scrollToSection(sectionId) {
    $("html, body").animate(
      {
        scrollTop: $(sectionId).offset().top - 50, // Adjust scroll offset as needed
      },
      1000 // Animation duration in milliseconds
    );
  }

  // Function to fetch news articles from News API
  function fetchNewsArticles(ticker) {
    const newsUrl = `https://newsapi.org/v2/everything?q=${ticker}&apiKey=${newsApiKey}`;

    $.ajax({
      url: newsUrl,
      method: "GET",
      success: function (response) {
        if (response.status === "ok") {
          displayNewsArticles(response.articles.slice(0, 6)); // Limit to 6 articles

          // Set up auto-scrolling of news articles
          autoScrollNews();
        } else {
          console.error("Failed to fetch news articles:", response);
          alert("Failed to fetch news articles. Please try again later.");
        }
      },
      error: function (xhr) {
        console.error("Failed to fetch news articles:", xhr);
        alert("Failed to fetch news articles. Please try again later.");
      },
    });
  }

  // Function to display news articles in the UI
  function displayNewsArticles(articles) {
    const newsContainer = $(".news-articles");
    newsContainer.empty(); // Clear any existing news articles

    articles.forEach((article) => {
      const newsArticle = `
        <div class="news-article">
          <h3>${article.title.toUpperCase()}</h3>
          <p>${article.description}</p>
          <a href="${article.url}" target="_blank">Read more</a>
        </div>
      `;
      newsContainer.append(newsArticle);
    });
  }

  // Function to auto-scroll news articles
  function autoScrollNews() {
    const newsContainer = $(".news-articles");
    let scrollTop = 0;
    const scrollHeight = newsContainer.prop("scrollHeight");

    setInterval(() => {
      scrollTop += 1;
      if (scrollTop >= scrollHeight) {
        scrollTop = 0;
      }
      newsContainer.scrollTop(scrollTop);
    }, 100); // Adjust the interval time to control the scrolling speed
  }
});
