__author__ = 'Tinghao'

import pandas as pd
import json
import copy

diagnose = {}
action = {}
visit = []
tmpDiag = {}
tmpAction = {}
date = ''
vId = -1
curD = ''
dId = 0
aId = 0
curId = 0

delDiagnosis = set()
delAction = set()

for _, r in pd.read_excel('case_1_2_summary_v2.xlsx', 'Sheet3').iterrows():
    if r['Date']==r['Date']:
        date = r['Date']

    if r['Speciality'] == r['Speciality']:
        for d in delDiagnosis:
            del tmpDiag[' '.join(d.casefold().split())]
        for d in delAction:
            del tmpAction[' '.join(d.casefold().split())]

        delDiagnosis = set()
        delAction = set()

        if len(visit)>0:
            visit[-1]['Diagnosis']=copy.deepcopy(list(tmpDiag.values()))
            visit[-1]['Actions']=copy.deepcopy(list(tmpAction.values()))

        for _ in tmpDiag:
            tmpDiag[_]['active'] = False
            if tmpDiag[_]['level'] == 'None':
                delDiagnosis.add(tmpDiag[_]['name'])

        for _ in tmpAction:
            tmpAction[_]['active'] = False
            if ' '.join(tmpAction[_]['msg'].casefold().split()) == 'completed':
                delAction.add(tmpAction[_]['action'])

        vId+=1
        visit.append({
            'vId': vId,
            'date': str(date),
            'speciality': r['Speciality']
        })

    if r['Diagnosis'] == r['Diagnosis']:
        curD = r['Diagnosis']
        fldCurD = ' '.join(curD.casefold().split())
        if r['Diagnose Update']==r['Diagnose Update']:
             msg = tmpDiag[r['Diagnose Update'].casefold()]['dId']
             delDiagnosis.add(r['Diagnose Update'])
        else:
            msg = ''

        if fldCurD not in tmpDiag:

            tmpDiag[fldCurD] = {
                'dId': dId,
                'source':msg,
                'name': curD,
                'level': r['Severity/Importance to Patient'],
                'action': {},
                'update': 0,
                'active':True
            }

            diagnose[str(dId)] = [{
                'source':msg,
                'vId':vId,
                'name': curD,
                'level':r['Severity/Importance to Patient'],
                'action': {}
            }]

            dId += 1

        else:

            diagnose[str(tmpDiag[fldCurD]['dId'])].append({
                'source':msg,
                'vId':vId,
                'name':curD,
                'level':r['Severity/Importance to Patient'],
                'action':{}
            })
            tmpDiag[fldCurD]['source'] = msg
            tmpDiag[fldCurD]['level'] = r['Severity/Importance to Patient']
            tmpDiag[fldCurD]['update'] += 1
            tmpDiag[fldCurD]['active'] = True
    else:
        if r['Diagnose Update']==r['Diagnose Update']:
             # delDiagnosis.add(r['Diagnose Update'])
            tmpDiag[' '.join(r['Diagnose Update'].casefold().split())]['level'] = 'None'
            tmpDiag[' '.join(r['Diagnose Update'].casefold().split())]['update'] += 1
            tmpDiag[' '.join(r['Diagnose Update'].casefold().split())]['active'] = True


    if r['Action'] == r['Action']:
        a = r['Action']
        fldA = ' '.join(a.casefold().split())
        aMsg = r['Action Update'] if r['Action Update'] == r['Action Update'] else ''
        if a.casefold() not in tmpAction:
            action[fldA] = {
                'aId':aId,
                'action':a,
                'visit':{
                    str(vId):{
                        'msg':aMsg
                    }
                }
            }
            tmpAction[fldA]={
                'aId':len(action),
                'action':a,
                'msg':aMsg,
                'update':0,
                'active':True
            }

            aId += 1

        else:
            action[fldA]['visit'][str(vId)] = {'msg': r['Action Update'] if r['Action Update'] == r['Action Update'] else ''}
            tmpAction[fldA]['msg'] = aMsg
            tmpAction[fldA]['update'] += 1
            tmpAction[fldA]['active'] = True

        if r['Diagnosis'] == r['Diagnosis']:
            diagnose[str(curId)][-1]['action'].update({a: aMsg})
            tmpDiag[' '.join(curD.casefold().split())]['action'].update({a: aMsg})

for d in delDiagnosis:
    del tmpDiag[' '.join(d.casefold().split())]
for d in delAction:
    del tmpAction[' '.join(d.casefold().split())]

visit[-1]['Diagnosis']=list(tmpDiag.values())
visit[-1]['Actions']=list(tmpAction.values())

json.dump({
    'visit':visit,
    'diagnosis':diagnose,
    'action':list(action.values())
},open('case1.json','w'),indent=4)