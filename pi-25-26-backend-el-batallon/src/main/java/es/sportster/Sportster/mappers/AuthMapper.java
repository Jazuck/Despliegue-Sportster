package es.sportster.Sportster.mappers;

import es.sportster.Sportster.DTOS.auth.RegisterCreateRequest;
import es.sportster.Sportster.models.User;

public class AuthMapper {

    private AuthMapper() {}

    public static User toEntity(RegisterCreateRequest dto) {
        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setPassword(dto.password());
        return user;
    }
}
