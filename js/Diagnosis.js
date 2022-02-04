// Operation on the bubble panel

let clsDiagnosis = function(dtDiagnosis){};

// Browsing mode
function showDiagnosis(vId,dtDiagnosis,preUpdate,dtVisit){
    let curD = -1;
    let svg=d3.select('#panDiagnosis').append('svg')
        .attr('viewBox', '0  0 ' + dnWidth + ' ' + dnHeight)
        .attr('height','84%')
        .attr('width','100%')
        .append('g');

    let simulation = d3.forceSimulation(dtDiagnosis)
        .force('charge', d3.forceManyBody())
        .alphaMin(0.02)
        .force('center', d3.forceCenter(dnWidth / 2, dnHeight / 2))
        .force('collision', d3.forceCollide().radius(d=>sclSeverity(d.level)))
            // .iterations(2)
        .force('x',d3.forceX(0))
        .force('y',d3.forceY(0))
        .on('tick', ticked);

    function ticked(){
        svg.selectAll('g').attr('transform',d=>`translate(${d.x},${d.y})`);
    }
    let bblDiagnosis = svg.selectAll('g').data(dtDiagnosis.filter(d=>lstSeverity.indexOf(d.level)<=intSeverity && d.level != 'None'))
        .enter().append('g')
        .on('click',d=>{
            if(curD!=d.dId){
                curD = d.dId;
                tlDiagnosis(dtVisit.relatedDiagnosis(vId,d.dId))
            }else{
                // $('#timlineDiagnosis').empty();
            }
        })
        .on('dblclick',function(d){
            if(blnUnlock){
                d3.event.preventDefault();

                let ind=lstSeverity.indexOf(d.level);
                ind==lstSeverity.length-1?ind=0:ind++;

                d.level=lstSeverity[ind];
                reset();
                // simulation.nodes(d3.select(this).data())
                //     .alpha(.4)
                //     .alphaTarget(.02)
                //     .restart();
                // d3.select(this).select('circle').attr('r',x=>sclSeverity(x.level));
            }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    function reset(){
        bblDiagnosis.selectAll('circle')
            .transition()
            .attr('r',d=>sclSeverity(d.level));

        simulation
            .nodes(bblDiagnosis.data())
            .alpha(.4)
            .alphaTarget(.02)
            .restart();
    }

    bblDiagnosis.append('circle')
        .attr('r', d=>sclSeverity(d.level))
        .attr('fill',d=>{
            if(d.active){return 'orange';}
            if(d.update==preUpdate[d.dId.toString()]){
                return 'lightgray';
            }else{
                return 'orange';
            }
        })
        .attr('stroke','gray')
        .attr('stroke-width',2);

    bblDiagnosis.append('text')
            .attr('text-anchor','middle')
            .attr('alignment-baseline','central')
            .text(d=>{
                let tmpTextLength = (4-lstSeverity.indexOf(d.level))*3+2;
                return d.name.length>tmpTextLength?d.name.slice(0,tmpTextLength) + '...':d.name.slice(0,tmpTextLength);
            });

    // Drag
    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) simulation.alphaTarget(.02).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.02);
        d.fx = null;
        d.fy = null;
    }

}

// Show time line for specific diagnosis
function tlDiagnosis(lstDiagnosis){
    $('#timlineDiagnosis').empty();

    // Prepare data
    let objDiagnosis={};
    $.each(lstDiagnosis[0],(i,d)=>{
        if(typeof(objDiagnosis[d.vId])=='undefined'){
            objDiagnosis[d.vId]={
                vId:d.vId,
                speciality:d.speciality
            };
        }
        if(typeof(objDiagnosis[d.vId].Diagnosis)=='undefined'){objDiagnosis[d.vId].Diagnosis=[];}
        objDiagnosis[d.vId].Diagnosis.push({
            level:d.level,
            name:d.name
        })
    })
    
    let svgDiagnosis=d3.select('#timlineDiagnosis').append('svg')
        .attr('viewBox', '0  0 ' + tlWidth + ' ' + dntlHeight)
        .attr('height','100%')
        .attr('width','100%');

    let lstLink = d3.extent(Object.values((objDiagnosis)),d=>d.vId)
    svgDiagnosis.append('g').append('line')
        .attr('x1',lstDiagnosis[1]*(lstLink[0]+0.5))
        .attr('x2',lstDiagnosis[1]*(lstLink[1]+0.5))
        .attr('y1',0)
        .attr('y2',0)
        .attr('stroke','red')
        .attr('stroke-width',5)

    let bblDiagnosis = svgDiagnosis
        .append('g').selectAll('g')
        .data(Object.values((objDiagnosis))).enter()
        .append('g')
        .attr('transform',d=>`translate(${lstDiagnosis[1]*(d.vId+0.5)+step/2},0)`)
        // .attr('transform',d=>`translate(${lstDiagnosis[1]*(d.vId+0.5)+step/2},${dntlHeight/2})`)
       .attr('fill',d=>sclSpeciality(d.speciality));
        // .attr('fill','orange');

    const pie = d3.pie()
        .value(1)
        .sort(null)
        .startAngle(Math.PI/2)
        .endAngle(Math.PI*3/2);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(d=>sclSeverity(d.data.level));

    bblDiagnosis.selectAll('path')
        .data(d=>pie(d.Diagnosis)).enter()
        .append('path')
        .attr('d',arc)
        .attr('stroke','gray')
        .attr('stroke-width',2)
}