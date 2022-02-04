// Set control parameter, arrange whole interface, read data

// Global control
let lstCase = ['','case1','case2'];
let pnlVisit, pnlDiagnosis,pnlAction;   // Define the main objects
let intSeverity = 3;   // Index of severity
let sclSeverity, sclSpecialityColor;   // Scale for severity
let preVisit = 0;
let indUnlock = -1,blnUnlock = false;


// Set elements
d3.select('#selectcase').selectAll('option')
    .data(lstCase).enter()
    .append('option')
    .attr('value',d=>d)
    .text(d=>d);
d3.select('#filterseverity').selectAll('option')
    .data(lstSeverity).enter()
    .append('option')
    .attr('value',(d,i)=>i)
    .text(d=>d);
d3.select('#specialitylist').selectAll('option').data(lstSpeciality).enter()
    .append('option').attr('value',d=>d).text(d=>d);
d3.select('#newbubblelevel').selectAll('option').data(lstSeverity).enter()
    .append('option').attr('value',d=>d).text(d=>d);

// Load data
function StartCase(eleSelect){
    let caseId =eleSelect.value;
    if (caseId==''){return;}
    // Discard unsaved changing

    $('#svgDiagnosis').empty();
    // Load new data
    d3.json(caseId+'.json').then(function(data){
        // console.log(data.visit.length)
        // console.log(data.diagnosis.length)
        // console.log(data.action.length)
        sclSeverity = d3.scaleBand().domain(lstSeverity).range([maxBubble, minBubble]);
        sclSpeciality = d3.scaleOrdinal(d3.schemeSet2);

        d3.select('#diagnoselist').selectAll('option').data([...new Set(data.visit[data.visit.length-1].Diagnosis.map(x=>x.name))]).enter()
            .append('option').attr('value',d=>d).text(d=>d);

        pnlDiagnosis = new clsDiagnosis(data.diagnosis);
        pnlVisit = new clsVisit(data.visit,pnlDiagnosis,pnlAction);
        pnlVisit.actVisit(preVisit);

        // Change browsing mode
        $('#filterseverity').val(intSeverity);
        $('#filterseverity').show();
        $('#filterseverity').on('change',function(){
            intSeverity = this.value;
            pnlVisit.actVisit(preVisit);
        })

        $('#switchmode').off().on('click',function(){
            blnComparing = !blnComparing;

            if(blnComparing){
                this.classList.add('comparemode');
                $('#panAction').hide()
            }else{
                this.classList.remove('comparemode');
                $('#panAction').show()
            }

            pnlVisit.actVisit(preVisit);
            // return false;
        });

        // Add new visit
        $('#addnewvisit').show();
        $('#addnewvisit').off().on('click',function(){
            if (this.value=='New Visit'){

                bootbox.dialog({
                    message:$('#formNewVisit').show(),
                    title:'Add a new visit.',
                    buttons:[
                        {
                            label:'OK',
                            className:'btn btn-primary pull-left',
                            callback:()=>{
                                indUnlock = data.visit.length;

                                data.visit.push({
                                    vid:indUnlock,
                                    date:new Date($('form #newdate').val().replace(/-/g,'/')+' 00:00:00'),
                                    speciality:$('form #newspeciality').val(),
                                    Diagnosis:data.visit[data.visit.length-1].Diagnosis,
                                    Actions:data.visit[data.visit.length-1].Actions
                                });

                                $('#addnewdiagnosis').show();
                                this.value='Submit';

                                pnlVisit = new clsVisit(data.visit,pnlDiagnosis,pnlAction);
                                pnlVisit.actVisit(indUnlock);

                                $('body').append($('#formNewVisit').hide());
                                return;
                            }
                        },
                        {
                            label:'Cancel',
                            className:'btn btn-primary pull-left',
                            callback:()=>{
                                $('body').append($('#formNewVisit').hide());
                                return;
                            }
                        }
                    ]
                });

            }else{

                $('#addnewdiagnosis').hide();
                this.value = 'New Visit';

                location.href =  "data:application/octet-stream," + encodeURIComponent(JSON.stringify(data));
                return true;
            }
        });

        // Add new diagnosis
        $('#addnewdiagnosis').off().on('click',function(){
            if(blnUnlock){
                bootbox.dialog({
                    message:$('#formNewDiagnosis').show(),
                    title:'Add a new diagnosis',
                    buttons:[
                        {
                            label:'OK',
                            className:'btn btn-primary pull-left',
                            callback:()=>{
                                data.visit[preVisit].Diagnosis.push({
                                    dId:data.visit[data.visit.length-1].Diagnosis.length,
                                    name:$('form #newbubblediagnose').val(),
                                    level:$('form #newbubblelevel').val(),
                                    source:'',
                                    active:true,
                                    update:0,
                                    action:{}
                                })

                                pnlVisit = new clsVisit(data.visit,pnlDiagnosis,pnlAction);
                                pnlVisit.actVisit(indUnlock);

                                $('body').append($('#formNewDiagnosis').hide());
                                return;
                            }
                        },
                        {
                            label:'Cancel',
                            className:'btn btn-primary pull-left',
                            callback:()=>{
                                $('body').append($('#formNewDiagnosis').hide());
                                return;
                            }
                        }
                    ]
                });
            }

            // AddNewDiagnosis();
        })

    })
}



// Add new diagnosis
function AddNewDiagnosis(){
    // Add new diagnosis
};

// When window size change, adjust according to the smaller one of width and height
function fnSize(){
    if(window.innerHeight/window.innerWidth<0.75){
        $('#container').css('width','133.3vh');
        $('#container').css('height','100vh');
    }else{
        $('#container').css('width','100wh');
        $('#container').css('height','75wh');
    }
}