

function handleContentLoaded(e){
    const board = document.querySelector('#listMessageBoard');

    const formCreateMessage = document.querySelector('#formCreateMessage');

    board.addEventListener('click', handleMessageBoardClick)
    formCreateMessage.addEventListener('submit', handleFormCreateMessageSubmit)

    const {width, height} = board.getBoundingClientRect();

    document.querySelectorAll('.message-board-item').forEach(item => {
        const {left, top} = item.dataset;

        item.style.left = `${left * 100}%`;
        item.style.top = `${top * 100}%`;
    })

    const buttonCreateChannel = document.querySelector('#buttonCreateChannel');
    buttonCreateChannel.addEventListener('click', handleButtonCreateChannelClick);

}

function handleButtonCreateChannelClick(event){
    const modal = document.querySelector('#createChannelModal');
    modal.classList.add('modal--shown');
}

function handleFormCreateMessageSubmit(event) {
    // todo: validate inputs

    const modal = document.querySelector('#createMessageModal');
    modal.classList.remove('modal--shown');
}

function handleMessageBoardClick(event){
    const board = event.target;

    const {width, height} = board.getBoundingClientRect();
    const {offsetX, offsetY} = event;

    // const x = clientX - left;
    // const y = clientY - top;

    const modal = document.querySelector('#createMessageModal');
    const inputLeft = document.querySelector('#inputLeft');
    const inputTop = document.querySelector('#inputTop');

    inputLeft.value = offsetX / width;
    inputTop.value = offsetY / height;

    modal.classList.add('modal--shown');

}

document.addEventListener("DOMContentLoaded", handleContentLoaded)
