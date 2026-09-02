(() => {
  const links = [...document.querySelectorAll('.nav-links > a.nav-link')];
  if (links.length < 5) return;

  const configure = (element, label, href, overlay = null) => {
    element.textContent = label;
    element.href = href;
    element.removeAttribute('data-overlay');
    if (overlay) element.dataset.overlay = overlay;
  };

  configure(links[0], 'Solutions', '#solutions');
  configure(links[1], 'Evolution', '#evolution');
  configure(links[2], 'Products', '/products/');
  configure(links[3], 'Design', '/design/');
  configure(links[4], 'Company', '#company', 'about');

  // Hidden triggers keep Team and Contact inside the existing first-party
  // pearl drawer system without exposing them as competing top-level routes.
  const hiddenHost = document.createElement('div');
  hiddenHost.hidden = true;
  hiddenHost.setAttribute('aria-hidden', 'true');
  hiddenHost.innerHTML = [
    '<button type="button" id="padiemDrawerCompanyTrigger" data-overlay="about"></button>',
    '<button type="button" id="padiemDrawerTeamTrigger" data-overlay="team"></button>',
    '<button type="button" id="padiemDrawerContactTrigger" data-overlay="inquiry"></button>'
  ].join('');
  document.body.appendChild(hiddenHost);

  const requestedPanel = new URLSearchParams(location.search).get('panel');
  const panelTrigger = {
    company: 'padiemDrawerCompanyTrigger',
    team: 'padiemDrawerTeamTrigger',
    contact: 'padiemDrawerContactTrigger'
  }[requestedPanel];

  // This script executes immediately before the existing overlay runtime.
  // Defer the synthetic click until the current script stack has completed so
  // the original runtime has bound its data-overlay listeners first.
  if (panelTrigger) {
    setTimeout(() => document.getElementById(panelTrigger)?.click(), 0);
  }
})();
