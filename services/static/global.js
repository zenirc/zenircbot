$(function(){
    var scriptsElement = $('#scripts')
    $.get('/scripts').success(function(a){
        a.scripts.forEach(function(element){
            var row = $('<tr>')
            row.append($('<td>', {text: element + ': '}))
            row.append($('<td>').append(createButton('start', element)))
            row.append($('<td>').append(createButton('restart', element)))
            row.append($('<td>').append(createButton('stop', element)))
            scriptsElement.append(row)
        })
    }).done(function(){
        $('.scriptBtn').on('click', function(event){
            $.get($(this).attr('href'))
            event.preventDefault()
        })
    })
})

function createButton(type, name) {
    var btn = $('<a>', {
        class: 'btn scriptBtn',
        text: type,
        href: '/do/' + type + '/' + name,
    })
    return btn
}
