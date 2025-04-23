using UnityEngine;

public class BombProxy : MonoBehaviour
{
    [SerializeField] private float attackCooldown;
    [SerializeField] private Transform firePoint;
    [SerializeField] private GameObject[] projectile;
    private float cooldownTimer;

    private void Attack(){
        cooldownTimer = 0;

        projectile[FindProjectile()].transform.position = firePoint.position;
        projectile[FindProjectile()].GetComponent<Projectile>().SetDirection(Mathf.Sign(transform.localScale.x));
    }
    private int FindProjectile(){
        for(int i = 0; i < projectile.Length; i++){
            if (!projectile[i].activeInHierarchy)
            return i;
        }
        return 0;
    }
    private void Update()
    {
        cooldownTimer += Time.deltaTime;

        if(cooldownTimer >= Time.deltaTime)
            Attack();   
    }
    void OnTriggerEnter2D(Collider2D collision)
    {
        
    }

}
