let DB;

const form = document.querySelector('#form-citas'),
  namePet = document.querySelector('#mascota'),
  nameClient = document.querySelector('#cliente'),
  telephone = document.querySelector('#telefono'),
  date = document.querySelector('#fecha'),
  hours = document.querySelector('#hora'),
  symptoms = document.querySelector('#sintomas'),
  shifts = document.querySelector('#citas'),
  heading = document.querySelector('#administra');

// Functions 
const addData = (e) => {
  e.preventDefault();
  const newShift = {
    pet: namePet.value,
    client: nameClient.value,
    telephone: telephone.value,
    date: date.value,
    hours: hours.value,
    symptoms: symptoms.value
  };

  // en indexedDB se utilizan transacciones
  let transaction = DB.transaction(['shifts'], 'readwrite');
  let objectStore = transaction.objectStore('shifts');
  // console.log(objectStore);
  let request = objectStore.add(newShift);

  request.onsuccess = () => {
    form.reset();
  }

  transaction.oncomplete = () => {
    console.log('Cita agregada!');
    showShifts();
  }

  transaction.onerror = () => {
    console.log('Hubo un error');
  }

}

const showShifts = () => {
  cleanShifts();
  // crear objectStore
  let objectStore = DB.transaction('shifts').objectStore('shifts');
  // retornar peticion
  objectStore.openCursor().onsuccess = (e) => {

    let cursor = e.target.result;

    if (cursor) {
      let shiftHTML = document.createElement('li');
      shiftHTML.setAttribute('data-shift-id', cursor.value.key);
      shiftHTML.classList.add('list-group-item');

      shiftHTML.innerHTML = `
      <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.pet}</span></p>
      <p class="font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.client}</span></p>
      <p class="font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telephone}</span></p>
      <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.date}</span></p>
      <p class="font-weight-bold">Horas: <span class="font-weight-normal">${cursor.value.hours}</span></p>
      <p class="font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.symptoms}</span></p>
      `;
      // Boton borrar
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('borrar', 'btn', 'btn-sm', 'btn-danger');
      deleteBtn.innerHTML = '<span aria-hidden="true">x</span> Borrar';
      deleteBtn.onclick = deleteShift;

      shiftHTML.appendChild(deleteBtn);
      shifts.appendChild(shiftHTML);
      // Consultar los proximos registros
      cursor.continue();
    } else {
      if (!shifts.firstChild) {      // Cuando no hay registros
        heading.textContent = 'Agrega citas para comenzar';
        let list = document.createElement('p');
        list.classList.add('text-center');
        list.textContent = 'No hay registros';
        shifts.appendChild(list);
      } else {
        heading.textContent = 'Administra tus citas';
      }
    }
  }
}

const deleteShift = (e) => {
  const shiftID = Number(e.target.parentElement.getAttribute('data-shift-id'));
  let transaction = DB.transaction(['shifts'], 'readwrite');
  let objectStore = transaction.objectStore('shifts');

  let request = objectStore.delete(shiftID);

  transaction.oncomplete = () => {
    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
    console.log(`Se eliminno la cita con el id: ${shiftID}`);

    if (!shifts.firstChild) {      // Cuando no hay registros
      heading.textContent = 'Agrega citas para comenzar';
      let list = document.createElement('p');
      list.classList.add('text-center');
      list.textContent = 'No hay registros';
      shifts.appendChild(list);
    } else {
      heading.textContent = 'Administra tus citas';
    }
  }
}

const cleanShifts = () => {
  while (shifts.firstChild) shifts.removeChild(shifts.firstChild)
};

// Esperar por el DOm ready.container
window.addEventListener('load', () => {
  let createDB = window.indexedDB.open('shifts', 1);

  createDB.onerror = () => {
    console.log('Hubo un error');
  }
  createDB.onsuccess = () => {
    // console.log('Todo listo!');
    DB = createDB.result;
    showShifts();
    // console.log(DB);
  }
  // Este metodo solo funciona una vez, se utiliza para crear el schema de la BD 
  createDB.onupgradeneeded = (e) => {
    // console.log('Solo una vez!');
    let db = e.target.result;
    // Definir objectstore , toma 2 parametros el nombre de la BD y las opciones
    let objectStore = db.createObjectStore('shifts', {
      keyPath: 'key',
      autoIncrement: true
    });
    // crear indices y campos de la base de datos.
    // createIndex 3: nombre, key, opciones
    objectStore.createIndex('pet', 'pet', { unique: false });
    objectStore.createIndex('client', 'client', { unique: false });
    objectStore.createIndex('telephone', 'telephone', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false });
    objectStore.createIndex('hours', 'hours', { unique: false });
    objectStore.createIndex('symptoms', 'symptoms', { unique: false });

    console.log('Base de datos creada y lista!');
  }

});

form.addEventListener('submit', addData);
