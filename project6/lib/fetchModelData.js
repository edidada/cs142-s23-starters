/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    const fail = (statusText) => reject(Object.assign(new Error(statusText), {
      status: xhr.status, statusText
    }));
    xhr.open("GET", url, true);
    xhr.timeout = 15000;
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        fail(xhr.statusText);
        return;
      }
      try {
        resolve({ data: JSON.parse(xhr.responseText) });
      } catch (error) {
        fail("Invalid JSON response");
      }
    };
    xhr.onerror = () => fail(xhr.statusText || "Network error");
    xhr.ontimeout = () => fail("Request timed out");
    xhr.onabort = () => fail("Request aborted");
    xhr.send();
  });
}

export default fetchModel;
