const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const toast = $('#toast');
function notify(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2100)}
function go(page){
  $$('.page-view').forEach(v=>v.classList.remove('active'));
  const target=$(`#page-${page}`);
  if(target) target.classList.add('active');
  $$('.nav-link,.mobile-nav button').forEach(b=>b.classList.toggle('selected',b.dataset.page===page));
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));

const postText=$('#postText'), publishButton=$('#publishButton'), charCount=$('#charCount'), feed=$('#feed');
postText.addEventListener('input',()=>{
  charCount.textContent=`${postText.value.length}/280`;
  publishButton.disabled=!postText.value.trim()||postText.value.length>280;
});
function publishPost(){
  const content=postText.value.trim();
  if(!content||content.length>280)return;
  const article=document.createElement('article');article.className='post';
  const avatar=document.createElement('div');avatar.className='avatar avatar-me';avatar.textContent='MD';
  const body=document.createElement('div');body.className='post-content';
  const heading=document.createElement('div');heading.className='post-author';
  heading.innerHTML='<b>Michel Douglas</b><span class="muted">@micheldouglas · agora</span><button class="post-menu">···</button>';
  const p=document.createElement('p');p.textContent=content;
  const actions=document.createElement('div');actions.className='post-actions';
  actions.innerHTML='<button class="post-action"><span>♡</span><small>0</small></button><button class="post-action repost"><span>⇄</span><small>0</small></button><button class="post-action like"><span>♡</span><small class="count">0</small></button><button class="post-action"><span>↗</span></button>';
  body.append(heading,p,actions);article.append(avatar,body);feed.prepend(article);
  postText.value='';charCount.textContent='0/280';publishButton.disabled=true;notify('Publicação enviada');
}
publishButton.addEventListener('click',publishPost);
$('#sidebarPost').addEventListener('click',()=>{go('home');$('#composer').scrollIntoView({behavior:'smooth'});postText.focus()});
document.addEventListener('click',e=>{
  const like=e.target.closest('.post-action.like');
  if(like){like.classList.toggle('liked');const n=like.querySelector('.count');n.textContent=Number(n.textContent)+(like.classList.contains('liked')?1:-1)}
  const repost=e.target.closest('.post-action.repost');
  if(repost){repost.classList.toggle('reposted');const n=repost.querySelector('small');n.textContent=Number(n.textContent)+(repost.classList.contains('reposted')?1:-1)}
});

$$('.timeline-tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.timeline-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');
  if(tab.dataset.timeline==='following')notify('Feed de quem você segue selecionado');
}));

// Community directory and local demo interactions
let activeCategory='Todas';
function filterCommunities(){
  const q=$('#communitySearch').value.toLowerCase();
  $$('.community-card').forEach(card=>{
    const matchesCategory=activeCategory==='Todas'||card.dataset.category===activeCategory;
    const matchesText=card.dataset.name.toLowerCase().includes(q)||card.textContent.toLowerCase().includes(q);
    card.style.display=matchesCategory&&matchesText?'':'none';
  });
}
$('#communitySearch').addEventListener('input',filterCommunities);
$$('.category-chip').forEach(chip=>chip.addEventListener('click',()=>{
  $$('.category-chip').forEach(c=>c.classList.remove('active'));chip.classList.add('active');
  activeCategory=chip.dataset.category;filterCommunities();
}));
$$('.join-button').forEach(btn=>btn.addEventListener('click',()=>{
  const joined=btn.classList.toggle('joined');btn.textContent=joined?'Participando':'Participar';
  notify(joined?'Você entrou na comunidade':'Você saiu da comunidade');
}));
const communityData={
  'Tecnologia sem filtro':{category:'Tecnologia',description:'Debates sobre tecnologia, programação, inovação e o futuro digital.',stats:'8,4 mil membros · 42 tópicos',symbol:'⌘',cover:'cover-tech'},
  'Clube dos jogadores':{category:'Games',description:'Jogos, lançamentos, recomendações e conversas sem fim.',stats:'5,2 mil membros · 31 tópicos',symbol:'◈',cover:'cover-games'},
  'Cinema e cultura':{category:'Cultura',description:'Filmes, séries, livros, música e tudo que vale uma boa conversa.',stats:'3,7 mil membros · 26 tópicos',symbol:'▣',cover:'cover-culture'},
  'Papo de todo dia':{category:'Cotidiano',description:'Assuntos cotidianos, experiências, perguntas e opiniões.',stats:'2,9 mil membros · 18 tópicos',symbol:'✳',cover:'cover-life'}
};
function openCommunity(name,card){
  const data=communityData[name]||{category:card?.dataset.category||'Geral',description:card?.querySelector('p')?.textContent||'Comunidade criada por membros do Firefly.',stats:'1 membro · 0 tópicos',symbol:'✳',cover:'cover-tech'};
  $('#detailName').textContent=name;$('#detailDescription').textContent=data.description;$('#detailStats').textContent=data.stats;
  $('#detailCover').className='detail-cover community-cover '+data.cover;$('#detailCoverSymbol').textContent=data.symbol;
  go('community-detail');
}
$$('.community-card h3').forEach(h=>h.addEventListener('click',()=>openCommunity(h.textContent,h.closest('.community-card'))));
$$('.community-card .community-cover').forEach(c=>c.addEventListener('click',()=>openCommunity(c.closest('.community-card').dataset.name,c.closest('.community-card'))));
$$('.mini-join').forEach(b=>b.addEventListener('click',()=>{b.textContent=b.textContent==='+'?'✓':'+';notify(b.textContent==='✓'?'Comunidade adicionada':'Comunidade removida')}));
$('#backCommunities').addEventListener('click',()=>go('communities'));
$('#allCommunities').addEventListener('click',()=>{activeCategory='Todas';$('#communitySearch').value='';$$('.category-chip').forEach(c=>c.classList.toggle('active',c.dataset.category==='Todas'));filterCommunities()});

const modal=$('#communityModal');
$('#createCommunity').addEventListener('click',()=>modal.classList.add('open'));
$('#closeModal').addEventListener('click',()=>modal.classList.remove('open'));
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
$('#saveCommunity').addEventListener('click',()=>{
  const name=$('#newCommunityName').value.trim(),description=$('#newCommunityDescription').value.trim(),category=$('#newCommunityCategory').value;
  if(!name){notify('Informe o nome da comunidade');return}
  const card=document.createElement('article');card.className='community-card';card.dataset.category=category;card.dataset.name=name;
  const cover=document.createElement('div');cover.className='community-cover '+({Tecnologia:'cover-tech',Games:'cover-games',Cultura:'cover-culture',Cotidiano:'cover-life'}[category]);cover.innerHTML='<span>✳</span>';
  const body=document.createElement('div');body.className='community-card-body';
  const icon=document.createElement('div');icon.className='community-icon '+({Tecnologia:'icon-tech',Games:'icon-games',Cultura:'icon-culture',Cotidiano:'icon-life'}[category]);icon.textContent='✳';
  const h=document.createElement('h3');h.textContent=name;
  const p=document.createElement('p');p.textContent=description||'Comunidade criada por membros do Firefly.';
  const stats=document.createElement('div');stats.className='community-stats';stats.innerHTML='<span>● 1 membro</span><span>0 tópicos</span>';
  const join=document.createElement('button');join.className='join-button joined';join.textContent='Participando';join.addEventListener('click',()=>{const state=join.classList.toggle('joined');join.textContent=state?'Participando':'Participar'});
  body.append(icon,h,p,stats,join);card.append(cover,body);$('#communityGrid').prepend(card);
  communityData[name]={category,description:description||'Comunidade criada por membros do Firefly.',stats:'1 membro · 0 tópicos',symbol:'✳',cover:({Tecnologia:'cover-tech',Games:'cover-games',Cultura:'cover-culture',Cotidiano:'cover-life'}[category])};
  card.querySelector('h3').addEventListener('click',()=>openCommunity(name,card));cover.addEventListener('click',()=>openCommunity(name,card));
  modal.classList.remove('open');$('#newCommunityName').value='';$('#newCommunityDescription').value='';activeCategory='Todas';$$('.category-chip').forEach(c=>c.classList.toggle('active',c.dataset.category==='Todas'));filterCommunities();notify('Comunidade criada');
});
$('#createTopic').addEventListener('click',()=>{
  const title=$('#topicTitle').value.trim(),body=$('#topicBody').value.trim();
  if(!title){notify('Informe o título do tópico');return}
  const item=document.createElement('article');item.className='topic';
  const avatar=document.createElement('div');avatar.className='topic-avatar';avatar.textContent='MD';
  const content=document.createElement('div');const h=document.createElement('b');h.textContent=title;
  const p=document.createElement('p');p.textContent=body;
  const meta=document.createElement('small');meta.textContent='Michel Douglas · agora · 0 respostas';
  content.append(h,p,meta);item.append(avatar,content);$('#topicList').prepend(item);
  $('#topicTitle').value='';$('#topicBody').value='';notify('Tópico publicado');
});
