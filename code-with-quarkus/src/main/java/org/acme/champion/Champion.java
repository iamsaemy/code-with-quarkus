package org.acme.champion;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "champions")
public class Champion extends PanacheEntity {

    public String name;
    public String engName;
    public String role;
    public String line;
    public String img;
    public String difficulty;
}