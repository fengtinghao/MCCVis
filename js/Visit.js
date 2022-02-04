//
let clsVisit = function(dtVisit,instDiagnosis,instAction){
    $('#timeline').empty();
    $('#visitline').empty();
    let self = this;

    $.each(dtVisit, function(i,d){
        if (i == 0){
            d.off = 0;
            return
        }
        if(typeof(d.date)=='string'){d.date = new Date(d.date.replace(/-/g,'/'))};

        d.valid = true;
        if (i == 1 || isNaN(d.date)){
            d.off = 10;
            return
        }else{
            let diffDays = Math.round(Math.abs((d.date.getTime() - dtVisit[i-1].date.getTime())/(oneDay)));
            let off = 0;
            if (diffDays == 0){
                off = 0
            }
            else if (diffDays == 1){
                off = 2
            }
            else if (diffDays < 7){
                off = 5
            }
            else if (diffDays < 30){
                off = 10
            }
            else if (diffDays < 180){
                off = 20
            }
            else if (diffDays < 365){
                off = 40
            }
            else
                off = 80;

            d.off = dtVisit[i-1].off + off
        }
    });

    // Add time line
    let sclTime = d3.scaleLinear().range([0, tlWidth-step*2]).domain([0, dtVisit[dtVisit.length-1].off]);

    let svgTimeLine = d3.select('#timeline').append('svg')
        .attr('viewBox', '0  0 ' + tlWidth + ' ' + tlHeight)
        .attr('height','100%')
        .attr('width','100%');

    let line=svgTimeLine.append('g').attr('transform','translate(0, ' + tlHeight/2 + ')');

    line.append('line')
        .attr('x1',step/2).attr('x2',tlWidth-step/2)
        .attr('y1',0).attr('y2',0)
        .attr('stroke','lightgray')
        .attr('stroke-width',step);

    let smDay=0;
    line.selectAll('note').data(dtVisit)
        .enter().append('g')
        .attr('transform',(d,i)=>{
            if(i>1 && d.off==dtVisit[i-1].off){
                return 'translate(' + (sclTime(d.off) + step*(++smDay) +step/2) + ',0)';
            }else{
                smDay=0;
                return 'translate(' + (sclTime(d.off)+step/2) + ',0)';
            }

        })
        .attr('fill',d=>sclSpeciality(d.speciality))
    .append('rect')
        .attr('x',0).attr('y',step/-2)
        .attr('width',step).attr('height',step)
        .on('click',(d,i)=>{
            // render bubble
            if(preVisit!=i){this.actVisit(i);}
        });

    // Add visit panel
    let detail = d3.select('#visitline').selectAll('panel').data(dtVisit)
        .enter().append('div')
        .attr('class', 'visit')
        .style('width',(100/dtVisit.length).toString()+'%')
        .style('border-color', d=>sclSpeciality(d.speciality))
        .style('background', d=>sclSpeciality(d.speciality))
        .on('click',(d,i)=>{
            // render bubble
            if(preVisit!=i){this.actVisit(i);}

        });

    detail.append('div')
        .attr('class','content')
        .text(d=>d.speciality);
    detail.append('div')
        .style('position','absolute')
        .style('bottom','5px')
        .style('left','50%')
        .style('transform','translateX(-50%)')
//        .style('font-size','24px')
        .style('color','gray')
        .text(d=>isNaN(d.date)?'':(d.date.getMonth()+1) +'/'+ d.date.getDate()+'/'+d.date.getFullYear().toString().substr(-2));

    this.actVisit = function(vId){
        $('#panDiagnosis').empty();
        $('#panAction').empty();

        if(vId==indUnlock){
            blnUnlock=true;
            $('#addnewdiagnosis').show();
        }else{
            blnUnlock=false;
            $('#addnewdiagnosis').hide();
        }

        // hightlight according to comparing mode
        detail.style('opacity',(d,i)=>i==vId?0.8:0.2);



        let preUpdate = {};
        $.each(dtVisit[preVisit].Diagnosis,(i,d)=>{
            preUpdate[d.dId.toString()]=d.update;
        });
        showDiagnosis(vId,dtVisit[vId].Diagnosis, preUpdate, self);
        showAction(dtVisit[vId].Actions);


        $('#timlineDiagnosis').empty();
        preVisit=vId;
    };

    // Calculate related diagnosis
    this.relatedDiagnosis = function(vId,dId){
        let res=[];
        let lstRelated=[dId];
        for(let i=vId;i>=0;i--){
            $.each(dtVisit[i].Diagnosis.filter(x=>x.active),(j,d)=>{
                if(lstRelated.includes(d.dId)){
                    res.push({
                        vId:i,
                        speciality:dtVisit[i].speciality,
                        level:d.level,
                        name:d.name
                    });
                    if(d.source){lstRelated.push(d.source);}
                }
            });
        }
        for(let i=vId+1;i<dtVisit.length;i++){
            $.each(dtVisit[i].Diagnosis.filter(x=>x.active),(j,d)=>{
                if(lstRelated.includes(d.source)){lstRelated.push(d.dId)}
                if(lstRelated.includes(d.dId)){
                    res.push({
                        vId:i,
                        speciality:dtVisit[i].speciality,
                        level:d.level,
                        name:d.name
                    });
                }
            });
        }

        let width = (tlWidth - step)/dtVisit.length;

        return [res,width];
    }
};