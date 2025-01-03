import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-customer-survey',
  templateUrl: './customer-survey.component.html',
  styleUrls: ['./customer-survey.component.scss'],
})
export class CustomerSurveyComponent implements OnInit {
  stopId;
  answerList;
  questionList;
  currentStop;
  public questionForm: FormGroup;
  constructor(private routesService: RoutesService,
    private router: Router,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.stopId = params.stopId;
    });
    this.currentStop = JSON.parse(localStorage.getItem('currentStop'));
  }

  ngOnInit() {
    this.GetQuestionList();
    this.GetAnswerList();
    this.initProductForm();
  }

  initProductForm() {
    this.questionForm = this.formBuilder.group({
      question: this.formBuilder.array([])
    });
  }
  private createQuestionFormGroup(data): FormGroup {
    return new FormGroup({
      'id': new FormControl(data.QuestionID),
      'description': new FormControl(data.DEscrition),
      'questions': new FormControl(data.Question),
      'answer': new FormControl(null),
    });
  }
  getQuestionAnswerFormArrayControls(): AbstractControl[] {
    return (this.questionForm.get('question') as FormArray).controls;
  }

  getQuestion(index) {
    return this.questionForm.value.question[index].questions;
  }

  getAnswerFormControl(answer: AbstractControl): FormControl {
    return answer.get('answer') as FormControl;
  }

  GetQuestionList() {
    this.routesService.getQuestionList(this.stopId).subscribe(res => {
      if (res) {
        this.questionList = res;
        this.questionList.map((ques) => {
          this.addQuestionAnswerFormGroup(ques);
        });
      } else {
        this.utilService.showToastError('No Data Found');
      }
    })
  }

  public addQuestionAnswerFormGroup(data) {
    const question = this.questionForm.get('question') as FormArray
    question.push(this.createQuestionFormGroup(data))
  }


  GetAnswerList() {
    this.routesService.getAnswerList().subscribe(res => {
      if (res) {
        this.answerList = res;
      } else {
        this.utilService.showToastSucccess('Something went wrong');
      }
    })
  }

  Confirm() {
    const params = {
      stopId: this.stopId,
      questions: this.questionForm.value.question
    }
    if (this.utilService.isOnline) {
      this.routesService.updateQuestionAnswer(params).subscribe(res => {
        if (res) {
          this.utilService.showToastSucccess('Records updated successfully');
          this.utilService.customerSurvey.next(false);
          this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
        } else {
          this.utilService.showToastSucccess('Something went wrong');
        }
      })
    } else {
      this.utilService.customerSurvey.next(false);
      this.utilService.storeApiIntoPending('/updateQuestionAnswer', params, 'post','',this.stopId);
      this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
    }
  }

}
