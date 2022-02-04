// Create to-do list
function showAction(dtAction){
    let actTable = d3.select('#panAction').append('table');
    
    actTable.append('thead').append('tr').append('th')
        .text('Action');
    
    actTable.append('tbody').selectAll('tr')
        .data(dtAction).enter()
        .append('tr').style('border','1px solid black')
        .append('td')
        .html(d=>{
            if(d.msg){
                return ' ' + d.action + '<br>  - ' + d.msg;
            }else{
                return ' ' + d.action;
            }
        })
}