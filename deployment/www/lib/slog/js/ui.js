
function showContent(btn) {
  if (btn.hasAttribute("active")) {
    btn.removeAttribute("active");
  } else {
    btn.setAttribute("active", "");
  }
}

if (window.self !== window.top) {
  // document.write("The page is in an iFrame");
  // debugger;
} else {
  // document.write("The page is not in an iFrame");
}
