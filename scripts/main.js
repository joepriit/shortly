const mobileToggle = document.getElementById("toggle");
const mobileMenu = document.getElementById("nav-mobile");
const form = document.getElementById("form");
const formInput = document.getElementById("form-input");
const errorMessageDesktop = document.getElementById("error-message-desktop");
const errorMessageMobile = document.getElementById("error-message-mobile");
const submitButton = document.getElementById("submit");
const linksElement = document.getElementById("links");

let loading = false;
let showMobileMenu = false;
let links = [];

const initialize = () => {
  setFormOffset();
  getValidLinks();
  createLinkElements();
};

const onToggleMenu = () => {
  mobileToggle.innerHTML = `<i class='fas fa-${
    showMobileMenu ? "bars" : "times"
  }'></i>`;

  showMobileMenu = !showMobileMenu;

  if (showMobileMenu) {
    mobileMenu.classList.add("nav--mobile--show");
  } else {
    mobileMenu.classList.remove("nav--mobile--show");
  }
};

const onResize = () => {
  if (showMobileMenu) {
    const width = document.body.clientWidth;
    if (width >= 820) {
      onToggleMenu();
    }
  }

  setFormOffset();
};

const onSubmit = () => {
  setErrors(false);
  setLoading(true);

  axios
    .get(`https://api.shrtco.de/v2/shorten?url=${formInput.value}`)
    .then((response) => {
      setLoading(false);

      if (response.data.ok) {
        storeValidLink(response.data.result);
        createLinkElements();
        formInput.value = "";
      }
    })
    .catch((error) => {
      setLoading(false);
      validateErrorResponse(error.response.data.error_code);
      console.error(error);
    });
};

const onFormKeyDown = (event) => {
  if (event.keyCode == 13) {
    event.preventDefault();
    if (!loading) {
      onSubmit();
    }

    return false;
  }
};

const onCopyLink = (event) => {
  // Walk the DOM tree to get needed value
  const column = event.target.parentNode;
  const row = column.parentNode;
  const columns = row.childNodes;
  const url = columns[1].innerHTML;

  navigator.clipboard.writeText(url).then(
    () => {
      // Notify success of copy
      columns[2].innerHTML =
        '<button type="button" class="shortener__copy-button copy-button--success">Copied!</button>';

      // Reset copy button after 3 seconds
      setTimeout(() => {
        columns[2].innerHTML =
          '<button type="button" class="shortener__copy-button">Copy</button>';
      }, 1000 * 3);
    },
    (error) => {
      columns[1].innerHTML =
        '<button type="button" class="shortener__copy-button">Failed!</button>';
    }
  );
};

const setFormOffset = () => {
  const formHeight = form.offsetHeight;
  form.style.marginTop = -(formHeight / 2) + "px";
};

const getValidLinks = () => {
  const linksString = localStorage.getItem("links");
  links = linksString ? JSON.parse(linksString) : [];
};

const createLinkElements = () => {
  // Clear DOM from existing links
  linksElement.textContent = "";

  for (const link of links) {
    // Create container
    const linkContainer = document.createElement("div");
    linkContainer.setAttribute("class", "shortener__link-container");
    linksElement.appendChild(linkContainer);

    // Create columns
    const one = document.createElement("div");
    const two = document.createElement("div");
    const three = document.createElement("div");

    one.setAttribute("class", "shortener__original-link-column");
    two.setAttribute("class", "shortener__short-link-column");
    three.setAttribute("class", "shortener__copy-button-column");

    one.innerHTML = link.original_link;
    two.innerHTML = link.short_link;
    three.innerHTML =
      '<button type="button" class="shortener__copy-button">Copy</button>';

    three.addEventListener("click", onCopyLink);

    linkContainer.appendChild(one);
    linkContainer.appendChild(two);
    linkContainer.appendChild(three);
  }
};

const storeValidLink = (data) => {
  links.unshift(data);
  if (links.length > 3) {
    links = links.slice(0, 3);
  }

  localStorage.setItem("links", JSON.stringify(links));
};

const setErrors = (status, message = "") => {
  if (status) {
    formInput.classList.add("input--error");

    errorMessageDesktop.innerHTML = message;
    errorMessageMobile.innerHTML = message;

    errorMessageDesktop.classList.add("error-message--show");
    errorMessageMobile.classList.add("error-message--show");
  } else {
    errorMessageDesktop.classList.remove("error-message--show");
    errorMessageMobile.classList.remove("error-message--show");
    formInput.classList.remove("input--error");
  }
};

const setLoading = (status) => {
  loading = status;

  if (status) {
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitButton.disabled = true;
  } else {
    submitButton.innerHTML = "Shorten it!";
    submitButton.disabled = false;
  }
};

const validateErrorResponse = (errorCode) => {
  let message = "";

  switch (errorCode) {
    case 1: {
      message = "Please enter an URL...";
      break;
    }

    case 2: {
      message = "Invalid URL specified...";
      break;
    }

    case 3: {
      message = "Rate limit reached...";
      break;
    }

    case 4: {
      message = "Your IP address has been blocked...";
      break;
    }

    case 5: {
      message = "Slug already taken...";
      break;
    }

    case 6: {
      message = "Unknown error occurred...";
      break;
    }

    case 7: {
      message = "No code specified...";
      break;
    }

    case 8: {
      message = "Invalid code specified...";
      break;
    }

    case 9: {
      message = "Missing required parameters...";
      break;
    }

    case 10: {
      message = "Disallowed link specified...";
      break;
    }

    default: {
      message = "Error code out of bounds...";
      break;
    }
  }

  setErrors(true, message);
};

window.addEventListener("resize", onResize);
mobileToggle.addEventListener("click", onToggleMenu);
submitButton.addEventListener("click", onSubmit);
form.addEventListener("keydown", onFormKeyDown);

initialize();
