package es.sportster.Sportster.services;

import es.sportster.Sportster.interfaces.IRoleService;
import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleService implements IRoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role findByRoleName(String roleName) {
        return roleRepository.findByRoleName(roleName);
    }
}
