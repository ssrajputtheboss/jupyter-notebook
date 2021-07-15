const socket = io('http://localhost:7000/',{extraHeaders:{authentication:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOiJ3YWxsYWgtaGFiaWJpIiwiaWF0IjoxNjI2MzUwMTIyfQ.9_snipgTQp1MoSibxFrk5vcaKuqNql3KyOR-9-yd6aY'}})
const notebooks = []

window.onkeydown=(e)=>{
    if(e.keyCode === 13 && e.shiftKey){
        socket.emit('in',{input:notebooks[notebooks.length-1].e.getValue(),index:(notebooks.length-1)})
        e.preventDefault()
    }
}

function modifyOutput(output){
    return output.replace(/&/g,'&amp;').
        replace(/"/g,'&quot;').
        replace(/'/g,'&apos;').
        replace(/ |\t/g,'&nbsp;').
        replace('<','&lt;').
        replace(/>/g,'&gt;').
        replace(/\n/g,'<br>')
}

socket.on('out',({output,index})=>{
    output = modifyOutput(output)
    const p = document.getElementById('output-'+index)
    p.innerHTML += output
    p.style.display = 'block'
    notebooks[index].i = notebooks[index].e.getValue()
    notebooks[index].o += output 
    if(index === (notebooks.length-1))
        newNotebook()
})

function newNotebook(){
    const parent = document.getElementById('collection')
    const div = document.createElement('div')
    div.className='m-4 p-2 flex flex-col justify-start border-4 border-green-400'
    const textarea = document.createElement('textarea')
    textarea.setAttribute('id','editor-'+notebooks.length)
    const p = document.createElement('p')
    p.className="border-current border-2 p-2 mt-1 text-sm"
    p.setAttribute('id','output-'+notebooks.length)
    p.innerHTML=''
    p.style.display='none'
    div.appendChild(textarea)
    div.appendChild(p)
    parent.appendChild(div)
    if(notebooks.length){
        notebooks[notebooks.length-1].e.setOption('readOnly',true)
    }
    const editor = CodeMirror.fromTextArea(document.getElementById('editor-'+notebooks.length),{
        mode:'text/x-python',indentUnit:4,tabSize:4,theme:'the-matrix',lineNumbers:true,autofocus:true
    })
    editor.setValue('')
    editor.setSize('100%','10%')
    notebooks.push({
        e:editor,
        i:'',
        o:''
    })
}

newNotebook()