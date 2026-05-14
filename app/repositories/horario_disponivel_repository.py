from sqlalchemy.orm import Session
from app.models.horario_disponivel import HorarioDisponivel
from typing import List, Optional


class HorarioDisponivelRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_por_profissional(self, profissional_id: int) -> List[HorarioDisponivel]:
        return self.db.query(HorarioDisponivel).filter(HorarioDisponivel.profissional_id == profissional_id).all()

    def buscar_por_id(self, id: int) -> Optional[HorarioDisponivel]:
        return self.db.query(HorarioDisponivel).filter(HorarioDisponivel.id == id).first()

    def criar(self, horario: HorarioDisponivel) -> HorarioDisponivel:
        self.db.add(horario)
        self.db.commit()
        self.db.refresh(horario)
        return horario

    def atualizar(self, horario: HorarioDisponivel) -> HorarioDisponivel:
        self.db.commit()
        self.db.refresh(horario)
        return horario

    def deletar(self, horario: HorarioDisponivel) -> None:
        self.db.delete(horario)
        self.db.commit()
