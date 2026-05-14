import { Component, inject, signal } from '@angular/core';
import { form, required} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { Dragon } from '../../poco/models';

// || givenName.submitted))
interface SkillLevel { code: string | null, name: string };

@Component({
  selector: 'app-dragon-form',
  imports: [FormsModule, ButtonModule, InputTextModule, InputNumberModule, CheckboxModule, SelectModule, MessageModule],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm {
  dragon = signal(new Dragon());
  skillLevels = [
    { code: null, name: 'Select Skill Level...' },
    { code: 'b', name: 'Basic' },
    { code: 'm', name: 'Medium' },
    { code: 'a', name: 'Advanced' }
  ] as SkillLevel[]

  dragonForm = form(this.dragon, (fieldPath) => {
    required(fieldPath.givenName, {message: 'Given Name is required'});
  });

  onSubmit(event: Event) {
    console.log(this.dragon());
    console.log(this.dragonForm().valid());
    console.log(this.dragonForm().errorSummary());
    console.log(this.dragonForm.givenName().errors());
    console.log(this.dragonForm.givenName().invalid());
    console.log(this.dragonForm.givenName().touched());
  }
}
