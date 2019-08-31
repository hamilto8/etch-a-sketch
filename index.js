window.onload = ()=>{
    const container = document.querySelector("#container");
    const reset = document.querySelector("#reset");
    const randomBtn = document.querySelector("#random");
    const blackBtn = document.querySelector("#blackBtn");
    let black = true;
    let div;
    let tile;

    for(let i = 0; i < (16*16); i++){
        container.appendChild(document.createElement("div"));
    }
    div = container.childNodes;
    for (let i = 1; i < div.length; i++){
        div[i].classList.add(`tile`);
    }
    tile = document.querySelectorAll(".tile");
    for(let i = 0; i < tile.length; i++){
        tile[i].addEventListener('mouseenter', (e)=>{makeBlack(e)})
    }

    blackBtn.addEventListener('click', ()=>{
        black = true;
        console.log(black);
    })

    function makeBlack(e){
        if(black){
            e.target.style.backgroundColor = 'black';
        }
    }

    reset.addEventListener('click', resetCSS);

    function resetCSS(){
        black = true;
        for(let i = 0; i < tile.length; i++){
            tile[i].style.backgroundColor = 'rgb(223, 223, 223)';
        }
    }

    randomBtn.addEventListener('click', randomColors);

    function randomColors(){
        if(black){
            black = false;
        }
        for(let i = 0; i < tile.length; i++){
            tile[i].addEventListener('mouseenter', (e)=>{
                makeRandom(e);
            })
        }
    }
    function makeRandom(e){
        let r = Math.floor(Math.random()*256);
        let g = Math.floor(Math.random()*256);
        let b = Math.floor(Math.random()*256);
        if(!black){
            e.target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
    }
}