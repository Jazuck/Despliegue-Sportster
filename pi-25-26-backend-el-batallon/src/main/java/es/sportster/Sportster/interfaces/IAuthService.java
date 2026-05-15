package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.DTOS.auth.LoginCreateRequest;
import es.sportster.Sportster.DTOS.auth.LoginResponse;
import es.sportster.Sportster.DTOS.auth.RegisterCreateRequest;

public interface IAuthService {
    void register(RegisterCreateRequest request);
    LoginResponse login(LoginCreateRequest request);
}
