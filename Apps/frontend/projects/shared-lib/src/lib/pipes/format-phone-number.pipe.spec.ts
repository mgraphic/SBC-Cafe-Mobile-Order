import { FomatPhoneNumberPipe } from './format-phone-number.pipe';

describe('FomatPhoneNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new FomatPhoneNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
