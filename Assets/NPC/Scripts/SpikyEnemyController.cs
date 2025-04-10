using UnityEngine;
using System.Collections;

public class SpikyEnemy : EnemyController
{
    float speed = 3;
    float idleSpeed = 1.5f;
    
    public override void Update()
    {
        base.Update();
        if (speed > 0.1f || idleSpeed > 0.1f)
        {
            speed = Mathf.Lerp(speed, 0, Time.deltaTime * 2);
            idleSpeed = Mathf.Lerp(idleSpeed, 0, Time.deltaTime * 2);
        }
        else
        {
            StartCoroutine(resetSpeed());
        }
    }

    private IEnumerator resetSpeed()
    {
        yield return new WaitForSeconds(0.5f);
        speed = 3;
        idleSpeed = 1.5f;
    }

    protected override void MoveTowardsTarget()
    {
        if (target == null) return;

        Vector2 TargetPosition = new Vector2(target.position.x, transform.position.y);
        transform.position = Vector2.MoveTowards(transform.position, TargetPosition, speed * Time.deltaTime);
    }

       protected override void MoveTowardsHome()
    {
        Vector2 homeTargetPosition = new Vector2(homePosition.x, homePosition.y);
        transform.position = Vector2.MoveTowards(transform.position, homeTargetPosition, speed * Time.deltaTime);
    }

    protected override IEnumerator IdleMoving()
    {

        while (currentState == State.Idle)
        {
        // Arvo satunnainen x kordinaatti koti alueelta
        float randomX = Random.Range(homePosition.x - moveRadius, homePosition.x + moveRadius);
        Vector2 targetPosition = new Vector2(randomX, homePosition.y);

            while (Vector2.Distance(transform.position, targetPosition) > 0.1f)
            {
                transform.position = Vector2.MoveTowards(transform.position, targetPosition, idleSpeed * Time.deltaTime);
                yield return null; // Odota seuraavaan frameen
            }

            // Odota hetki ennen uutta liikettä
            yield return new WaitForSeconds(Random.Range(1f, 3f)); // Odotusaika 1-3 sekuntia
        }
    }
}
