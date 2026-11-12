const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const postInput = $('#postInput');
const publishButton = $('#publish');
const counter = $('#counter');
const feedList = $('#feedList');
const toast = $('#toast');

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 2100);
}

postInput.addEventListener('input', () => {
  const length = postInput.value.trim().length;
  counter.textContent = `${postInput.value.length}/280`;
  publishButton.disabled = length === 0 || postInput.value.length > 280;
});

function actionButton(type, icon, value, label) {
  const button = document.createElement('button');
  button.className = `post-action ${type}`;
  button.setAttribute('aria-label', label);
  const symbol = document.createElement('span');
  symbol.className = 'action-icon';
  symbol.textContent = icon;
  button.append(symbol);
  if (value !== null) {
    const metric = document.createElement('span');
    metric.className = type === 'like-action' ? 'metric' : '';
    metric.textContent = value;
    button.append(metric);
  }
  return button;
}

function publishPost() {
  const text = postInput.value.trim();
  if (!text || text.length > 280) return;
  const article = document.createElement('article');
  article.className = 'post';
  const avatar = document.createElement('div');
  avatar.className = 'avatar avatar-me';
  avatar.textContent = 'MD';
  const content = document.createElement('div');
  content.className = 'post-content';
  const top = document.createElement('div');
  top.className = 'post-top';
  top.innerHTML = '<strong>Michel Douglas</strong><span class="muted">@micheldouglas</span><span class="muted">· agora</span>';
  const menu = document.createElement('button');
  menu.className = 'post-menu';
  menu.textContent = '···';
  top.append(menu);
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  const actions = document.createElement('div');
  actions.className = 'post-actions';
  actions.append(
    actionButton('comment-action', '◯', '0', 'Comentar'),
    actionButton('repost-action', '⇄', '0', 'Republicar'),
    actionButton('like-action', '♡', '0', 'Curtir'),
    actionButton('share-action', '↗', null, 'Compartilhar')
  );
  content.append(top, paragraph, actions);
  article.append(avatar, content);
  feedList.prepend(article);
  postInput.value = '';
  counter.textContent = '0/280';
  publishButton.disabled = true;
  notify('Publicação enviada');
}

publishButton.addEventListener('click', publishPost);
$('#openComposer').addEventListener('click', () => {
  $('#view-home').classList.add('active');
  $$('.view-panel').forEach(panel => { if (panel.id !== 'view-home') panel.classList.remove('active'); });
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === 'home'));
  $('#composer').scrollIntoView({behavior:'smooth', block:'center'});
  postInput.focus();
});

function showView(name) {
  $$('.view-panel').forEach(panel => panel.classList.toggle('active', panel.id === `view-${name}`));
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === name));
  window.scrollTo({top:0, behavior:'smooth'});
}
$$('[data-view]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  showView(button.dataset.view);
}));

document.addEventListener('click', event => {
  const like = event.target.closest('.like-action');
  if (like) {
    like.classList.toggle('liked');
    const metric = $('.metric', like);
    metric.textContent = Number(metric.textContent) + (like.classList.contains('liked') ? 1 : -1);
  }
  const repost = event.target.closest('.repost-action');
  if (repost) {
    repost.classList.toggle('reposted');
    const metric = $('span:not(.action-icon)', repost);
    metric.textContent = Number(metric.textContent) + (repost.classList.contains('reposted') ? 1 : -1);
  }
  const follow = event.target.closest('.follow-button');
  if (follow) {
    const following = follow.classList.toggle('following');
    follow.textContent = following ? 'Seguindo' : 'Seguir';
  }
  const join = event.target.closest('.small-join, .join-button');
  if (join) {
    const joined = join.classList.toggle('joined');
    join.textContent = joined ? 'Participando' : 'Participar';
    notify(joined ? 'Você entrou na comunidade' : 'Você saiu da comunidade');
  }
  if (event.target.matches('[data-close-modal]') || event.target === $('#communityModal')) closeModal();
});

$$('.feed-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.feed-tab').forEach(item => item.classList.toggle('selected', item === tab));
  if (tab.dataset.feed === 'following') notify('Feed de quem você segue');
}));

function openModal() {
  $('#communityModal').classList.add('open');
  $('#communityModal').setAttribute('aria-hidden', 'false');
  $('#newCommunityName').focus();
}
function closeModal() {
  $('#communityModal').classList.remove('open');
  $('#communityModal').setAttribute('aria-hidden', 'true');
}
$('#createCommunity').addEventListener('click', openModal);
$('#saveCommunity').addEventListener('click', () => {
  const name = $('#newCommunityName').value.trim();
  const description = $('#newCommunityDescription').value.trim();
  const category = $('#newCommunityCategory').value;
  if (!name) {
    $('#newCommunityName').focus();
    return;
  }
  const card = document.createElement('article');
  card.className = 'community-card';
  card.dataset.category = category;
  card.dataset.name = name.toLowerCase();
  const cover = document.createElement('div');
  cover.className = 'community-cover cover-blue';
  const initials = document.createElement('span');
  initials.textContent = name.slice(0, 2).toUpperCase();
  const label = document.createElement('b');
  label.textContent = 'NOVA COMUNIDADE';
  cover.append(initials, label);
  const body = document.createElement('div');
  body.className = 'community-card-body';
  const icon = document.createElement('div');
  icon.className = 'community-card-icon';
  icon.textContent = '✦';
  const title = document.createElement('h3');
  title.textContent = name;
  const desc = document.createElement('p');
  desc.textContent = description || 'Uma nova comunidade no Firefly.';
  const bottom = document.createElement('div');
  bottom.className = 'community-card-bottom';
  const members = document.createElement('span');
  members.textContent = '1 membro';
  const join = document.createElement('button');
  join.className = 'small-join joined';
  join.textContent = 'Participando';
  bottom.append(members, join);
  body.append(icon, title, desc, bottom);
  card.append(cover, body);
  $('#communityGrid').prepend(card);
  closeModal();
  $('#newCommunityName').value = '';
  $('#newCommunityDescription').value = '';
  notify('Comunidade criada nesta demonstração');
});

let activeCategory = 'Todas';
function filterCommunities() {
  const term = $('#communitySearch').value.trim().toLowerCase();
  $$('.community-card').forEach(card => {
    const matchesCategory = activeCategory === 'Todas' || card.dataset.category === activeCategory;
    const matchesTerm = !term || card.dataset.name.includes(term) || card.textContent.toLowerCase().includes(term);
    card.style.display = matchesCategory && matchesTerm ? '' : 'none';
  });
}
$$('.category-chip').forEach(chip => chip.addEventListener('click', () => {
  activeCategory = chip.dataset.category;
  $$('.category-chip').forEach(item => item.classList.toggle('active', item === chip));
  filterCommunities();
}));
$('#communitySearch').addEventListener('input', filterCommunities);
$$('.promo-button').forEach(button => button.addEventListener('click', () => showView('communities')));
