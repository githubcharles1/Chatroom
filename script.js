// PS! Replace this with your own channel ID
// If you use this channel ID your app will stop working in the future
const CLIENT_ID = 'CcOpq8ddXfMJ27E5';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getRandomName(),
    color: getRandomColor(),
  },
});

const room = drone.subscribe('awesome-historical-room', {
  historyCount: 5 // ask for the 5 most recent messages from the room's history
});
room.on('history_message', message => console.log(message));

let members = [];
let client;
let connect;
function setup () {
connect = new Connect();

//maak verbinding met oscServer.js, en voer code tussen {} uit zodra deze verbinding tot stand is gekomen.
connect.connectToServer(function() {
  //maak een nieuwe client-object aan.
  client = new Client();

  //start de client en laat deze berichten sturen naar het ip-adres 127.0.0.1 en poort 9000
  client.startClient("127.0.0.1",9000);
});
}

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({id}) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
    } else {
      // Message is from server
    }
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

function getRandomName() {
  const adjs = ["Nice", "Kloten", "DeEnigeEchte", "Mama's", "Papa's", "Vieste", "Smerigste", "Ranzigste", "Goorste", "Idiootste", "Kleinste", "Langste", "Domste", "Tippelaar", "Lichaamverkoper", "Appelpeerstok", "Appelmelk", "Baldadige", "Griezeligste", "Watersloot", "Deurbak", "Hoekstelmat", "Lappenvloer", "Lampensteen", "Flipperflopperlukflip", "Kouwesnavel", "Kussenvel", "Flikkerende", "Eikenhout", "Schilderschort", "LangedeIlse", "DeInAchtNemer", "AVATAR", "KATANA", "SNEEUWVLOPPER", "sleuteldas", "motjebarlemok", "jakkelmaf", "roldarteintje", "rougerdehouger", "stillenplichter", "smallenbetser", "sparklorieglorie", "trobhong", "sjieanorlam", "wandaaringklomp", "witteroosbloem", "wildevanillastok", "blakvlaksmak", "yountjeflountje", "holyshit", "solidariteitslied", "fragrant persoontje", "agelompjurtieklomandosrat", "snotloop", "productvandesamenleving1", "productvandesamenleving2", "productvandesamenleving3", "deballenbak", "porseleine", "eeuwenoude", "purpere", "kinderbueno", "paasei"];
  const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass", "haze", "mountain", "night", "pond", "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower", "wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog", "smoke", "star"];
  return (
    adjs[Math.floor(Math.random() * adjs.length)] +
    "_" +
    nouns[Math.floor(Math.random() * nouns.length)]
  );
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

//------------- DOM STUFF

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: value,
  });
}

function createMemberElement(member) {
  const { name, color } = member.clientData;
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  return el;
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.length} users in room:`;
  DOM.membersList.innerHTML = '';
  members.forEach(member =>
    DOM.membersList.appendChild(createMemberElement(member))
  );
}

function createMessageElement(text, member) {
  const el = document.createElement('div');
  el.appendChild(createMemberElement(member));
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  return el;
}

function addMessageToListDOM(text, member) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(text, member));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
