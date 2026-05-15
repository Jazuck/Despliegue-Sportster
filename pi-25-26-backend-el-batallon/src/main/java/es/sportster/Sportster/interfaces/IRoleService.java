package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.models.Role;

public interface IRoleService {

    Role findByRoleName(String roleName);
}